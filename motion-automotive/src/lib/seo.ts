import { useEffect } from 'react'
import { business } from '@/config/business'
import { socialProfiles } from '@/components/social-links'

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')

function setMeta(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

const prop = (name: string) => () => {
  const m = document.createElement('meta')
  m.setAttribute('property', name)
  return m
}
const named = (name: string) => () => Object.assign(document.createElement('meta'), { name })

/**
 * Sets the tab title, Google snippet, social preview text and canonical URL for the current page.
 * `noindex` keeps private or empty pages (staff, bookings, 404) out of search results.
 */
export function useSeo(title: string, description: string, path?: string, opts: { noindex?: boolean } = {}) {
  const { noindex = false } = opts
  useEffect(() => {
    document.title = title
    setMeta('meta[name="description"]', named('description'), 'content', description)
    setMeta('meta[property="og:title"]', prop('og:title'), 'content', title)
    setMeta('meta[property="og:description"]', prop('og:description'), 'content', description)
    setMeta('meta[name="twitter:title"]', named('twitter:title'), 'content', title)
    setMeta('meta[name="twitter:description"]', named('twitter:description'), 'content', description)
    setMeta('meta[name="robots"]', named('robots'), 'content', noindex ? 'noindex, nofollow' : 'index, follow')
    if (SITE_URL && path !== undefined) {
      setMeta('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', SITE_URL + path)
      setMeta('meta[property="og:url"]', prop('og:url'), 'content', SITE_URL + path)
    }
  }, [title, description, path, noindex])
}

/** schema.org data so Google can show the business, its locations and phone number. */
export function businessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: business.name,
    telephone: business.phone,
    email: business.email,
    ...(SITE_URL ? { url: SITE_URL, logo: `${SITE_URL}/motion-automotive-logo.png`, image: `${SITE_URL}/motion-automotive-logo.png` } : {}),
    areaServed: 'Baton Rouge, LA',
    ...(socialProfiles.length ? { sameAs: socialProfiles.map((s) => s.href) } : {}),
    department: business.locations
      .filter((l) => l.address)
      .map((l) => {
        const [street, city, stateZip] = l.address.split(', ')
        const [region, postalCode] = (stateZip ?? '').split(' ')
        return {
          '@type': 'AutoRental',
          name: `${business.name}, ${l.name}`,
          address: { '@type': 'PostalAddress', streetAddress: street, addressLocality: city, addressRegion: region, postalCode, addressCountry: 'US' },
        }
      }),
  }
}
