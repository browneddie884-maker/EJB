import { money } from '@/lib/utils'
import { business } from './business'
import type { Car } from '@/data/types'
import type { LandingSlug } from './landing-slugs'

export type LandingPage = {
  slug: LandingSlug
  /** Browser tab and Google result title. Keep under about 60 characters. */
  seoTitle: string
  /** Google result snippet. Keep under about 155 characters. */
  seoDescription: string
  headline: string
  intro: string
  /** Pickup location preselected in the search. */
  locationId?: string
  cars: (car: Car) => boolean
  carsHeading: string
  /** Show weekly instead of daily prices on the cards. */
  weekly?: boolean
  points: string[]
  faqs: [string, string][]
  /** Footer link label. */
  linkLabel: string
}

const pct = Math.round(business.weeklyDiscount * 100)
const airport = business.locations.find((l) => l.id === 'airport')!
const pickupList = business.locations.map((l) => l.name).join(', ')

export const landingPages: LandingPage[] = [
  {
    slug: 'airport-car-rental',
    seoTitle: 'Baton Rouge Airport Car Rental | Motion Automotive',
    seoDescription: `Rent a car at the Baton Rouge airport (BTR). Pick up at ${airport.address}. Sedans, SUVs, trucks and EVs. Your insurance or ours.`,
    headline: 'Car rental at the Baton Rouge airport',
    intro: `Book before you fly and pick up at ${airport.address}.`,
    locationId: 'airport',
    cars: () => true,
    carsHeading: 'Cars you can pick up at the airport',
    points: [`Pick up at ${airport.address}`, `Free cancellation up to ${business.freeCancellationHours} hours before pickup`, 'Use your own insurance or add Motion coverage'],
    faqs: [
      ['Where do I pick up?', `At our airport location, ${airport.address}. Your booking confirmation shows the address.`],
      ['What do I need to bring?', `A valid driver's license, a card for the refundable hold, and your insurance card if you are using your own policy.`],
      ['Can I return it somewhere else?', `Call us at ${business.phone} and we will tell you what is possible for your dates.`],
    ],
    linkLabel: 'Airport rentals',
  },
  {
    slug: 'truck-rental',
    seoTitle: 'Pickup Truck Rental in Baton Rouge | Motion Automotive',
    seoDescription: 'Rent a pickup truck in Baton Rouge: Toyota Tacoma, Ford F-150 and F-150 Raptor. Book online by the day or week.',
    headline: 'Pickup truck rental in Baton Rouge',
    intro: 'For the move, the job site or the weekend off road. Book online by the day or the week.',
    cars: (c) => c.category === 'Truck',
    carsHeading: 'Trucks',
    points: [`Book ${business.weeklyMinDays} days or more and save ${pct}%`, `Pick up at ${pickupList}`, 'Use your own insurance or add Motion coverage'],
    faqs: [
      ['Can I tow with a rental truck?', `Ask us before you book at ${business.phone} so we can confirm the right truck and equipment for your load.`],
      ['Is there a mileage limit?', `Call us at ${business.phone} for mileage terms on longer trips.`],
      ['How old do I need to be?', `${business.minDriverAge} or older. Drivers under ${business.youngDriverAge} pay a young driver fee.`],
    ],
    linkLabel: 'Truck rentals',
  },
  {
    slug: 'luxury-car-rental',
    seoTitle: 'Luxury & Sports Car Rental in Baton Rouge | Motion Automotive',
    seoDescription: 'Rent a Porsche, BMW, Audi, Mercedes-AMG, Mustang or Camaro in Baton Rouge. Book online and pick up at our lot, the airport or Bluebonnet Blvd.',
    headline: 'Luxury and sports car rental in Baton Rouge',
    intro: 'Weddings, game days, a weekend away or a car you have always wanted to drive.',
    cars: (c) => c.category === 'Luxury' || c.category === 'Sports',
    carsHeading: 'Luxury and sports cars',
    points: ['Porsche, BMW, Audi, Mercedes-AMG and more', `Free cancellation up to ${business.freeCancellationHours} hours before pickup`, 'Use your own insurance or add Motion coverage'],
    faqs: [
      ['How much is the deposit?', `A refundable hold of ${money(business.deposit.motionCoverage)} with Motion coverage, or ${money(business.deposit.ownInsurance)} if you use your own insurance.`],
      ['How old do I need to be?', `${business.minDriverAge} or older. Drivers under ${business.youngDriverAge} pay a young driver fee.`],
      ['Can I book for an event?', `Yes. Pick your dates online, or call ${business.phone} for help planning a wedding or group booking.`],
    ],
    linkLabel: 'Luxury cars',
  },
  {
    slug: 'weekly-car-rental',
    seoTitle: 'Weekly Car Rental in Baton Rouge | Motion Automotive',
    seoDescription: `Rent a car for a week or more in Baton Rouge and save ${pct}% on the daily rate. Sedans, SUVs, trucks and EVs.`,
    headline: 'Weekly car rental in Baton Rouge',
    intro: `Rent for ${business.weeklyMinDays} days or more and ${pct}% comes off the daily rate automatically at checkout.`,
    cars: () => true,
    carsHeading: 'Weekly prices',
    weekly: true,
    points: [`${pct}% off any rental of ${business.weeklyMinDays} days or more`, 'Good while your car is in the shop or for a long visit', 'Use your own insurance or add Motion coverage'],
    faqs: [
      ['How does the weekly price work?', `Book ${business.weeklyMinDays} days or more and the checkout takes ${pct}% off the car's daily rate. Coverage, extras and taxes are added as usual.`],
      ['My car is in the shop. Can I use my own insurance?', 'Yes. Choose "My own insurance" at checkout and enter your carrier and policy number.'],
      ['Can I extend my rental?', 'Yes. Change your dates from the My booking page, or call us.'],
    ],
    linkLabel: 'Weekly rentals',
  },
]
