import { business } from '@/config/business'
import type { Car } from '@/data/types'

/**
 * Phase 1 books through VEVS. Once its links are filled in (src/config/business.ts > vevs, or a
 * car's own VEVS link in the staff dashboard), every Reserve button opens VEVS and "My booking"
 * goes to VEVS's customer page. Left empty, the site's own checkout and lookup are used.
 */
export const vevsBooking = Boolean(business.vevs.bookingUrl)

/** Where a car's Reserve button goes: its VEVS page, the VEVS booking page, or our checkout. */
export function reserveTarget(car: Car, query: string): { href: string; external: boolean } {
  const url = car.vevsUrl || business.vevs.bookingUrl
  return url ? { href: url, external: true } : { href: `/book/${car.id}?${query}`, external: false }
}

/** Where "My booking" goes. */
export const myBooking = business.vevs.manageUrl
  ? { href: business.vevs.manageUrl, external: true }
  : { href: '/reservations', external: false }
