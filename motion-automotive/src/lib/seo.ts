import { useEffect } from 'react'
import { business } from '@/config/business'

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '')

function setMeta(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

/** Sets the tab title, Google snippet and canonical URL for the current page. */
export function useSeo(title: string, description: string, path?: string) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title
    setMeta('meta[name="description"]', () => Object.assign(document.createElement('meta'), { name: 'description' }), 'content', description)
    setMeta('meta[property="og:title"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:title'); return m }, 'content', title)
    setMeta('meta[property="og:description"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:description'); return m }, 'content', description)
    if (SITE_URL && path !== undefined) {
      setMeta('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', SITE_URL + path)
    }
    return () => {
      document.title = prevTitle
    }
  }, [title, description, path])
}

/** schema.org data so Google can show the business, its locations and phone number. */
export function businessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: business.name,
    telephone: business.phone,
    email: business.email,
    ...(SITE_URL ? { url: SITE_URL } : {}),
    areaServed: 'Baton Rouge, LA',
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
