/**
 * Everything the owner is likely to change lives here.
 * Prices, deposit, tax and contact details below are SAMPLE values. Replace them before launch.
 */
export const business = {
  name: 'Motion Automotive',
  shortName: 'Motion',
  phone: '(555) 014-2290', // TODO: real phone
  email: 'reservations@motionautomotive.com', // TODO: real email
  hours: 'Mon-Sat 8am-7pm, Sun 10am-4pm',
  locations: [
    { id: 'main', name: 'Motion Automotive lot', address: '' }, // TODO: lot street address (shown when filled in)
    { id: 'airport', name: 'Baton Rouge airport', address: '9430 Jackie Cochran Dr, Baton Rouge, LA 70807' },
    { id: 'bluebonnet', name: 'Bluebonnet Blvd', address: '4459B Bluebonnet Blvd, Baton Rouge, LA 70809' },
  ],
  taxRate: 0.0825,
  minDriverAge: 21,
  youngDriverAge: 25,
  youngDriverFeePerDay: 19,
  /** Refundable hold on the driver's card. Larger when the renter brings their own policy. */
  deposit: { ownInsurance: 400, motionCoverage: 200 },
  freeCancellationHours: 48,
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
  { id: 'driver', name: 'Additional driver', perDay: 12 },
  { id: 'child-seat', name: 'Child seat', perDay: 9 },
  { id: 'toll', name: 'Toll pass', perDay: 7 },
  { id: 'fuel', name: 'Prepaid fuel or charge', flat: 59 },
]
