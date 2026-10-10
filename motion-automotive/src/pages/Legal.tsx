import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { business, coveragePlans } from '@/config/business'
import { useSeo } from '@/lib/seo'
import { money } from '@/lib/utils'
import { openCookieSettings } from '@/components/cookie-consent'

/**
 * DRAFT legal pages written from what this site actually collects and does.
 * Have a Louisiana attorney review both before launch, then update LAST_UPDATED.
 */
const LAST_UPDATED = 'October 10, 2026'

function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <article className="container-page max-w-3xl pt-8">
      <p className="text-sm text-muted-foreground">Last updated {LAST_UPDATED}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tighter sm:text-5xl">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{intro}</p>
      <div className="mt-10 space-y-10 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted-foreground [&_p]:text-muted-foreground">
        {children}
      </div>
    </article>
  )
}

const contact = (
  <>
    {business.name}, {business.phone}, {business.email}
  </>
)

export function PrivacyPolicy() {
  useSeo(`Privacy Policy | ${business.name}`, `How ${business.name} collects, uses and protects your information when you book a rental.`, '/privacy')
  return (
    <LegalPage title="Privacy policy" intro={`This explains what ${business.name} collects when you use this website or rent from us, why, and the choices you have.`}>
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Booking details: the car, dates, pickup location, extras and price.</li>
          <li>Contact details: name, email address and phone number.</li>
          <li>Driver details: driver's license number and issuing state, and age.</li>
          <li>Insurance details if you use your own policy: insurance company, policy number and expiry date.</li>
          <li>How you found us: if you arrive from an ad, the ad campaign tags and click IDs in the link.</li>
          <li>Website usage, only if you accept analytics cookies: pages viewed, cars viewed and bookings started or completed.</li>
        </ul>
      </section>
      <section>
        <h2>Why we use it</h2>
        <ul>
          <li>To hold your reservation, contact you about it and prepare the car.</li>
          <li>To check you can legally drive and that your insurance covers the rental.</li>
          <li>To handle payments, deposits, damage, tolls, tickets and disputes.</li>
          <li>To understand which ads and pages bring bookings, and improve the site.</li>
          <li>To meet legal, tax and insurance record keeping requirements.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </section>
      <section>
        <h2>Who we share it with</h2>
        <ul>
          <li>Service providers that run the site and bookings for us, such as hosting, email and payment processing.</li>
          <li>Insurance companies, when a claim involves the rental or you choose Motion coverage.</li>
          <li>Google and Meta, for analytics and ad measurement, only if you accept analytics cookies.</li>
          <li>Law enforcement or toll and parking authorities when the law requires it, or for tickets and tolls incurred during your rental.</li>
        </ul>
      </section>
      <section>
        <h2>Cookies and storage in your browser</h2>
        <p>
          The site stores your light or dark mode choice and, in this version, your booking details in your browser so you can look them up again. Analytics and advertising cookies from Google and
          Meta load only after you accept them in the cookie banner. You can change your choice at any time.
        </p>
        <p>
          <button type="button" onClick={openCookieSettings} className="font-medium text-foreground underline underline-offset-4">
            Open cookie settings
          </button>
        </p>
      </section>
      <section>
        <h2>How long we keep it</h2>
        <p>
          We keep booking, driver and insurance records for as long as needed for the rental and any claims, and for the period the law requires for tax and insurance records. Analytics data is kept
          according to the settings of those tools.
        </p>
      </section>
      <section>
        <h2>Your choices</h2>
        <ul>
          <li>Ask for a copy of your information, or ask us to correct or delete it, by contacting us below.</li>
          <li>Decline analytics cookies, or withdraw consent later in cookie settings.</li>
          <li>Opt out of marketing emails using the link in any email.</li>
        </ul>
      </section>
      <section>
        <h2>Security</h2>
        <p>We use secure (HTTPS) connections and limit who can see driver and insurance details. No method of transmission or storage is completely secure.</p>
      </section>
      <section>
        <h2>Children</h2>
        <p>This site is for adults. Renters must be at least {business.minDriverAge}. We do not knowingly collect information from children.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Questions about privacy: {contact}.</p>
      </section>
    </LegalPage>
  )
}

export function Terms() {
  useSeo(`Rental Terms | ${business.name}`, `Rental terms for ${business.name}: eligibility, insurance, deposits, cancellations and returns.`, '/terms')
  return (
    <LegalPage
      title="Rental terms"
      intro={`These terms apply when you reserve or rent a vehicle from ${business.name}. You sign a full rental agreement at pickup, and that agreement controls if anything differs.`}
    >
      <section>
        <h2>Who can rent</h2>
        <ul>
          <li>Drivers must be {business.minDriverAge} or older and hold a valid driver's license.</li>
          <li>Drivers under {business.youngDriverAge} pay a young driver fee of {money(business.youngDriverFeePerDay)} per day.</li>
          <li>Every driver must be named on the rental. Additional drivers are added as an extra.</li>
        </ul>
      </section>
      <section>
        <h2>Reservations and prices</h2>
        <ul>
          <li>Prices shown are per day for the car, plus any coverage, extras and taxes listed at checkout.</li>
          <li>Rentals of {business.weeklyMinDays} days or more receive the weekly discount shown at checkout.</li>
          <li>No payment is taken online. You pay at pickup.</li>
          <li>We may need to substitute a similar vehicle if the reserved one is unavailable.</li>
        </ul>
      </section>
      <section>
        <h2>Deposit</h2>
        <p>
          A refundable hold is placed on your card at pickup: {money(business.deposit.motionCoverage)} with Motion coverage, or {money(business.deposit.ownInsurance)} if you use your own insurance. It
          is released after the car is returned and checked.
        </p>
      </section>
      <section>
        <h2>Insurance</h2>
        <ul>
          <li>If you use your own insurance, your policy must include collision and liability coverage that extends to rental cars, and you must show your insurance card at pickup.</li>
          <li>
            Motion coverage plans ({coveragePlans.map((p) => p.name).join(', ')}) are described at checkout and are subject to the full plan terms provided at pickup.
          </li>
          <li>You are responsible for damage, loss or theft not covered by your insurance or coverage plan, up to the applicable deductible or the vehicle's value.</li>
        </ul>
      </section>
      <section>
        <h2>Cancellations and changes</h2>
        <ul>
          <li>Cancel free of charge up to {business.freeCancellationHours} hours before pickup.</li>
          <li>Cancellations within {business.freeCancellationHours} hours of pickup are charged one day's rental.</li>
          <li>Change your dates on the My booking page, subject to availability. The price is recalculated.</li>
        </ul>
      </section>
      <section>
        <h2>Using the vehicle</h2>
        <ul>
          <li>No smoking or vaping, and no pets except service animals, unless agreed in advance.</li>
          <li>No racing, towing beyond the vehicle's rating, or use by unlisted drivers.</li>
          <li>Return the car with the same fuel or charge level, unless you bought the prepaid fuel extra.</li>
          <li>You are responsible for tolls, parking tickets and traffic fines during the rental, plus a reasonable admin fee.</li>
        </ul>
      </section>
      <section>
        <h2>Returns</h2>
        <p>Return the car to the location and time on your booking. Late returns may be charged an extra day. Contact us before your return time if you need more time.</p>
      </section>
      <section>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of the State of Louisiana.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          {contact}. See also our <Link to="/privacy" className="font-medium text-foreground underline underline-offset-4">privacy policy</Link>.
        </p>
      </section>
    </LegalPage>
  )
}
