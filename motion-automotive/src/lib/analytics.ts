/**
 * Ad and analytics tracking: Google Analytics 4, Google Ads conversions and the Meta (Facebook) Pixel.
 *
 * Nothing loads until an ID is set in the environment (see .env.example), so local
 * development and previews send no data. Each event below goes to whichever tools are on.
 */
import type { Reservation, Source } from '@/data/types'

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined
const ADS_ID = import.meta.env.VITE_GADS_ID as string | undefined
const ADS_BOOKING_LABEL = import.meta.env.VITE_GADS_BOOKING_LABEL as string | undefined
const META_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined

type Gtag = (...args: unknown[]) => void
type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown }
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
    fbq?: Fbq
    _fbq?: Fbq
  }
}

let started = false

/** True when at least one tracking tool has an ID, i.e. there is something to consent to. */
export const trackingConfigured = Boolean(GA_ID || ADS_ID || META_ID)

const CONSENT_KEY = 'motion.consent.v1'
export type Consent = 'granted' | 'denied'

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

/** Saves the visitor's choice. Accepting loads the tags right away; declining keeps them off. */
export function setConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value)
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  if (value === 'granted') {
    initAnalytics()
    trackPageView(window.location.pathname + window.location.search)
  }
}

function addScript(src: string) {
  const s = document.createElement('script')
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

/**
 * Loads the configured tags once, and only after the visitor accepts analytics cookies.
 * Page views are sent by trackPageView on each route change.
 */
export function initAnalytics() {
  if (started || typeof window === 'undefined' || getConsent() !== 'granted') return
  started = true

  if (GA_ID || ADS_ID) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      // gtag.js reads the raw arguments object from dataLayer.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
    window.gtag('js', new Date())
    if (GA_ID) window.gtag('config', GA_ID, { send_page_view: false })
    if (ADS_ID) window.gtag('config', ADS_ID)
    addScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID ?? ADS_ID}`)
  }

  if (META_ID && !window.fbq) {
    const fbq: Fbq = function fbq(...args: unknown[]) {
      fbq.queue!.push(args)
    }
    fbq.queue = []
    fbq.loaded = true
    fbq.version = '2.0'
    window.fbq = fbq
    window._fbq = fbq
    addScript('https://connect.facebook.net/en_US/fbevents.js')
    window.fbq('init', META_ID)
  }
}

export function trackPageView(path: string) {
  if (GA_ID) window.gtag?.('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title })
  if (META_ID) window.fbq?.('track', 'PageView')
}

type CarRef = { id: string; make: string; model: string; dailyRate: number; category: string }
const item = (car: CarRef) => ({ item_id: car.id, item_name: `${car.make} ${car.model}`, item_category: car.category, price: car.dailyRate })

export function trackViewCar(car: CarRef) {
  if (GA_ID) window.gtag?.('event', 'view_item', { currency: 'USD', value: car.dailyRate, items: [item(car)] })
  if (META_ID) window.fbq?.('track', 'ViewContent', { content_ids: [car.id], content_type: 'product', value: car.dailyRate, currency: 'USD' })
}

export function trackBeginBooking(car: CarRef, total: number) {
  if (GA_ID) window.gtag?.('event', 'begin_checkout', { currency: 'USD', value: total, items: [item(car)] })
  if (META_ID) window.fbq?.('track', 'InitiateCheckout', { content_ids: [car.id], value: total, currency: 'USD' })
}

/** The conversion ads optimise for: a confirmed booking, valued at its total. */
export function trackBooking(r: Reservation, car: CarRef) {
  if (GA_ID) window.gtag?.('event', 'purchase', { transaction_id: r.code, currency: 'USD', value: r.total, items: [item(car)] })
  if (ADS_ID && ADS_BOOKING_LABEL) {
    window.gtag?.('event', 'conversion', { send_to: `${ADS_ID}/${ADS_BOOKING_LABEL}`, value: r.total, currency: 'USD', transaction_id: r.code })
  }
  if (META_ID) window.fbq?.('track', 'Purchase', { content_ids: [car.id], value: r.total, currency: 'USD' }, { eventID: r.code })
}

const SOURCE_KEY = 'motion.source'

/**
 * Remembers where a visitor came from (utm_* tags and Google/Meta click IDs on the landing URL)
 * for this browser session, so the booking can be credited to the ad that brought it.
 */
export function captureSource(search: string) {
  const p = new URLSearchParams(search)
  const found: Source = {
    utmSource: p.get('utm_source') ?? undefined,
    utmMedium: p.get('utm_medium') ?? undefined,
    utmCampaign: p.get('utm_campaign') ?? undefined,
    gclid: p.get('gclid') ?? undefined,
    fbclid: p.get('fbclid') ?? undefined,
  }
  if (!Object.values(found).some(Boolean)) return
  try {
    sessionStorage.setItem(SOURCE_KEY, JSON.stringify({ ...found, landingPage: window.location.pathname + window.location.hash.split('?')[0] }))
  } catch {
    /* storage unavailable */
  }
}

export function currentSource(): Source | undefined {
  try {
    const raw = sessionStorage.getItem(SOURCE_KEY)
    return raw ? (JSON.parse(raw) as Source) : undefined
  } catch {
    return undefined
  }
}

/** Short label for staff, e.g. "Google Ads", "facebook / cpc / weekend-trucks". */
export function describeSource(s?: Source) {
  if (!s) return 'Direct or unknown'
  if (s.utmSource) return [s.utmSource, s.utmMedium, s.utmCampaign].filter(Boolean).join(' / ')
  if (s.gclid) return 'Google Ads'
  if (s.fbclid) return 'Facebook / Instagram'
  return 'Direct or unknown'
}
