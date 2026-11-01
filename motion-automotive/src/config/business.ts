/**
 * Everything the owner is likely to change lives here.
 * Hours and the lot address are the client's. Phone and email are placeholders until the Cox line
 * and the Motion email account are set up. Daily rates and deposits are set per car (src/data/fleet.ts
 * or the staff dashboard); tax and coverage prices below are still SAMPLE values.
 */
export const business = {
  name: 'Motion Automotive',
  shortName: 'Motion',
  phone: '(555) 014-2290', // TODO: real number once the Cox line is installed
  email: 'reservations@motionautomotive.com', // TODO: real address once the Motion email account exists
  hours: 'Mon-Sat 10am-6pm, closed Sunday',
  /**
   * Social profiles. Paste each full profile link when the account exists, e.g.
   * instagram: 'https://www.instagram.com/motionautomotive'. Empty ones stay hidden on the site.
   */
  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
    x: '',
    youtube: '',
    /** Google Business Profile reviews link ("Ask for reviews" > copy link). */
    googleReviews: '',
  },
  /**
   * Phase 1: bookings run on VEVS. Paste the links from the VEVS dashboard here and every Reserve
   * button opens VEVS (bookingUrl), and "My booking" opens VEVS's customer page (manageUrl).
   * A car can also have its own VEVS link, set in the staff dashboard. Empty = the site's own checkout.
   */
  vevs: {
    bookingUrl: '',
    manageUrl: '',
  },
  locations: [
    { id: 'main', name: 'Motion Automotive lot', address: '10313 Greenwell Springs Rd, Baton Rouge, LA 70814' },
    { id: 'airport', name: 'Baton Rouge airport', address: '9430 Jackie Cochran Dr, Baton Rouge, LA 70807' },
    { id: 'bluebonnet', name: 'Bluebonnet Blvd', address: '4459B Bluebonnet Blvd, Baton Rouge, LA 70809' },
  ],
  taxRate: 0.0825,
  minDriverAge: 21,
  youngDriverAge: 25,
  youngDriverFeePerDay: 19,
  /** Smallest refundable card hold; each car sets its own deposit from here up. */
  minDeposit: 200,
  /** SAMPLE: charged per mile over a car's included miles (cars with unlimited miles never pay it). */
  extraMileFee: 0.35,
  freeCancellationHours: 48,
  /** Rentals of this many days or more get the weekly discount below. */
  weeklyMinDays: 7,
  /** SAMPLE: share taken off the car's daily rate for weekly rentals. */
  weeklyDiscount: 0.15,
}

export type CoveragePlanId = 'essential' | 'standard' | 'complete'

export const coveragePlans: {
  id: CoveragePlanId
  name: string
  perDay: number
  deductible: number
  summary: string
  includes: string[]
}[] = [
  {
    id: 'essential',
    name: 'Essential',
    perDay: 18,
    deductible: 1500,
    summary: 'Covers damage to the rental car.',
    includes: ['Collision damage waiver', 'Theft protection'],
  },
  {
    id: 'standard',
    name: 'Standard',
    perDay: 29,
    deductible: 500,
    summary: 'Car damage plus third-party liability.',
    includes: ['Everything in Essential', 'Supplemental liability up to $1M', '24/7 roadside help'],
  },
  {
    id: 'complete',
    name: 'Complete',
    perDay: 41,
    deductible: 0,
    summary: 'Walk away from any damage with nothing owed.',
    includes: ['Everything in Standard', 'Zero deductible', 'Tires, glass and lockout cover', 'Personal effects cover'],
  },
]

export const extras: { id: string; name: string; perDay?: number; flat?: number }[] = [
  { id: 'driver', name: 'Additional licensed driver', flat: 50 },
  { id: 'child-seat', name: 'Child seat', perDay: 9 },
  { id: 'toll', name: 'Toll pass', perDay: 7 },
  { id: 'fuel', name: 'Prepaid fuel or charge', flat: 59 },
]
