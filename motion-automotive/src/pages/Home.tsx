import { Link, useHref, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Check, FileText, ShieldCheck } from 'lucide-react'
import DigitalSerenity from '@/components/ui/digital-serenity-animated-landing-page'
import { CinematicFooter } from '@/components/ui/motion-footer'
import { QuickSearch } from '@/components/quick-search'
import { SiteNav } from '@/components/site-nav'
import { CarImage } from '@/components/car-image'
import { MakeLogo } from '@/components/make-logo'
import { business, coveragePlans } from '@/config/business'
import { categories, type Car, type Category } from '@/data/types'
import { useStore } from '@/store/store'
import { cn, money } from '@/lib/utils'

const categoryCopy: Record<Category, string> = {
  Sedan: 'Easy on fuel, easy to park.',
  SUV: 'Room for the family and the luggage.',
  Truck: 'Haul it, tow it, take it off road.',
  Electric: 'Charged and ready at pickup.',
  Sports: 'For the weekend you have been planning.',
  Luxury: 'Arrive like it matters.',
}

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function CategoryBento({ cars }: { cars: Car[] }) {
  const tiles = categories
    .map((cat) => {
      const inCat = cars.filter((c) => c.category === cat && c.status !== 'retired')
      if (!inCat.length) return null
      const cover = [...inCat].sort((a, b) => b.dailyRate - a.dailyRate)[0]
      return { cat, count: inCat.length, from: Math.min(...inCat.map((c) => c.dailyRate)), cover }
    })
    .filter(Boolean) as { cat: Category; count: number; from: number; cover: Car }[]

  // Desktop 3-column bento, shaped to however many categories are in stock so no cell is left empty.
  const spans: Record<number, string[]> = {
    6: ['md:row-span-2', '', '', '', '', 'md:col-span-3'],
    5: ['md:row-span-2', '', '', '', ''],
    4: ['md:row-span-2', '', '', 'md:col-span-2'],
    3: ['md:col-span-2', '', 'md:col-span-3'],
    2: ['md:col-span-2', ''],
    1: ['md:col-span-3'],
  }
  return (
    <div className="grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[240px]">
      {tiles.map((t, i) => (
        <Reveal key={t.cat} delay={i * 0.05} className={spans[tiles.length]?.[i]}>
          <Link to={`/fleet?type=${t.cat}&view=wheel`} className="group relative block h-full overflow-hidden rounded-3xl">
            <CarImage car={t.cover} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">{t.cat}</h3>
                {(i === 0 || tiles.length < 5 || spans[tiles.length]?.[i]?.includes('col-span')) && <p className="mt-1 max-w-[30ch] text-sm text-white/80">{categoryCopy[t.cat]}</p>}
              </div>
              <p className="shrink-0 text-right text-sm">
                <span className="block text-white/70">{t.count} {t.count === 1 ? 'car' : 'cars'}, from</span>
                <span className="text-lg font-semibold">{money(t.from)}/day</span>
              </p>
            </div>
            <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </Reveal>
      ))}
    </div>
  )
}

function Protection() {
  return (
    <section id="protection" className="container-page scroll-mt-6 pt-28">
      <Reveal>
        <h2 className="max-w-[18ch] text-3xl font-semibold tracking-tighter sm:text-5xl">Your insurance or ours. You choose at checkout.</h2>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal className="flex flex-col rounded-3xl border border-border bg-card p-7 sm:p-9">
          <FileText className="h-7 w-7 text-signal-strong" strokeWidth={1.5} />
          <h3 className="mt-5 text-2xl font-semibold tracking-tight">Use your own policy</h3>
          <p className="mt-2 max-w-[44ch] leading-relaxed text-muted-foreground">
            Most personal auto policies cover rentals. Add your carrier and policy number when you book and pay nothing extra for coverage.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {['Active policy with collision and liability', 'Insurance card shown at pickup', `${money(business.deposit.ownInsurance)} refundable card hold`].map((t) => (
              <li key={t} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />{t}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08} className="rounded-3xl bg-foreground p-7 text-background sm:p-9">
          <ShieldCheck className="h-7 w-7 text-signal" strokeWidth={1.5} />
          <h3 className="mt-5 text-2xl font-semibold tracking-tight">Or add Motion coverage</h3>
          <p className="mt-2 max-w-[44ch] leading-relaxed opacity-75">
            No paperwork, nothing to claim on your own policy, and a smaller {money(business.deposit.motionCoverage)} hold.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {coveragePlans.map((p) => (
              <div key={p.id} className={cn('rounded-2xl border border-background/15 p-4', p.id === 'standard' && 'border-signal')}>
                <p className="text-sm opacity-75">{p.name}</p>
                <p className="mt-1 text-2xl font-semibold">{money(p.perDay)}<span className="text-sm font-normal opacity-70">/day</span></p>
                <p className="mt-2 text-sm opacity-75">{p.deductible ? `${money(p.deductible)} deductible` : 'No deductible'}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

const steps = [
  { verb: 'Choose', text: 'Pick dates and a car. You see the full price, taxes included, before you pay.' },
  { verb: 'Cover', text: 'Add your own insurance details or one of our three coverage plans.' },
  { verb: 'Drive', text: 'Show your license and pick up at our lot, the Baton Rouge airport or Bluebonnet Blvd.' },
]

/** Router-aware link props for the footer's plain anchors. */
function useAppLink() {
  const navigate = useNavigate()
  const fleet = useHref('/fleet')
  const booking = useHref('/reservations')
  const staff = useHref('/staff')
  const insurance = useHref('/#protection')
  const go = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    navigate(to)
  }
  return {
    fleet: { href: fleet, onClick: go('/fleet') },
    booking: { href: booking, onClick: go('/reservations') },
    staff: { href: staff, onClick: go('/staff') },
    insurance: { href: insurance, onClick: go('/#protection') },
  }
}

export default function Home() {
  const { cars } = useStore()
  const links = useAppLink()
  const makes = [...new Set(cars.filter((c) => c.status !== 'retired').map((c) => c.make))].sort()

  return (
    <>
      {/* The landing is always dark, whatever theme the rest of the site is in. */}
      <div className="dark relative">
        <div className="absolute inset-x-0 top-0 z-30">
          <SiteNav />
        </div>
        <DigitalSerenity
          topLine={business.name}
          headline="Let us put you in Motion."
          subline="Sedans to sports cars, booked in minutes. Bring your own insurance or use ours."
          bottomLine="Choose. Cover. Drive."
        >
          <QuickSearch />
        </DigitalSerenity>
      </div>

      <section className="container-page pt-20" aria-label="Browse by make">
        <ul className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {makes.map((m) => (
            <li key={m} className="snap-start">
              <Link to={`/fleet?make=${encodeURIComponent(m)}`} className="flex items-center gap-2.5 rounded-full border border-border px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors hover:border-foreground">
                <MakeLogo make={m} className="h-5 w-5" />
                {m}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page pt-14">
        <Reveal className="mb-8 flex items-end justify-between gap-6">
          <h2 className="text-3xl font-semibold tracking-tighter sm:text-5xl">Pick by how you drive</h2>
          <Link to="/fleet" className="btn-ghost hidden sm:inline-flex">All {cars.filter((c) => c.status !== 'retired').length} cars</Link>
        </Reveal>
        <CategoryBento cars={cars} />
      </section>

      <Protection />

      <section className="container-page pt-28">
        <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.verb} delay={i * 0.06} className="bg-background p-7 sm:p-9">
              <p className="text-5xl font-semibold tracking-tighter text-signal-strong sm:text-6xl">{s.verb}</p>
              <p className="mt-4 max-w-[34ch] leading-relaxed text-muted-foreground">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page pt-28">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tighter sm:text-4xl">Before you book</h2>
            <p className="mt-3 max-w-[40ch] leading-relaxed text-muted-foreground">
              Still unsure? Call us at <a className="font-medium text-foreground underline underline-offset-4" href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}>{business.phone}</a>.
            </p>
          </Reveal>
          <Reveal delay={0.06} className="divide-y divide-border border-y border-border">
            {[
              ['How old do I need to be?', `Drivers must be ${business.minDriverAge} or older with a valid license. Drivers under ${business.youngDriverAge} pay ${money(business.youngDriverFeePerDay)} per day.`],
              ['What if I use my own insurance?', `Enter your carrier, policy number and expiry when you book, and bring your insurance card. We place a ${money(business.deposit.ownInsurance)} refundable hold on your card.`],
              ['Can I cancel?', `Yes. Cancel free up to ${business.freeCancellationHours} hours before pickup from the My booking page.`],
              ['Where do I pick up?', business.locations.map((l) => (l.address ? `${l.name}: ${l.address}` : l.name)).join('. ') + '.'],
            ].map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                  {q}
                  <span className="text-2xl leading-none text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-[60ch] leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      <div className="mt-28">
        <CinematicFooter
          giantText="MOTION"
          heading="Ready to drive?"
          marquee={['Sedans to sports cars', 'Your insurance or ours', 'Free cancellation up to 48 hours', 'Pickup at the Baton Rouge airport', 'Clear daily rates']}
          primaryLinks={[
            { label: 'Find a car', ...links.fleet },
            { label: 'My booking', ...links.booking },
          ]}
          secondaryLinks={[
            { label: business.phone, href: `tel:${business.phone.replace(/[^\d+]/g, '')}` },
            { label: business.email, href: `mailto:${business.email}` },
            { label: 'Insurance options', ...links.insurance },
            { label: 'Staff login', ...links.staff },
          ]}
          copyright={`© ${new Date().getFullYear()} ${business.name}`}
          badge={<span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase md:text-xs">Open {business.hours}</span>}
        />
      </div>
    </>
  )
}
