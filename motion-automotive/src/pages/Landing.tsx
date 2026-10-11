import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { CarCard } from '@/components/car-card'
import { QuickSearch } from '@/components/quick-search'
import type { LandingPage } from '@/config/landing-pages'
import { business } from '@/config/business'
import { businessJsonLd, useSeo } from '@/lib/seo'
import { useStore } from '@/store/store'

/** One page per ad theme (airport, trucks, luxury, weekly), so each ad lands on exactly what it promised. */
export default function Landing({ page }: { page: LandingPage }) {
  const { cars, isAvailable } = useStore()
  useSeo(page.seoTitle, page.seoDescription, `/${page.slug}`)
  const list = cars
    .filter((c) => c.status !== 'retired' && page.cars(c))
    .sort((a, b) => Number(isAvailable(b.id)) - Number(isAvailable(a.id)) || a.dailyRate - b.dailyRate)
  const loc = page.locationId ? `?loc=${page.locationId}` : ''

  return (
    <div className="container-page pt-6">
      <script type="application/ld+json">{JSON.stringify(businessJsonLd())}</script>

      <section className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <h1 className="text-4xl leading-[1.05] font-semibold tracking-tighter text-balance sm:text-5xl lg:text-6xl">{page.headline}</h1>
          <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">{page.intro}</p>
        </div>
        <ul className="grid gap-3 text-sm lg:col-span-5 lg:pb-2">
          {page.points.map((p) => (
            <li key={p} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />{p}</li>
          ))}
        </ul>
      </section>

      <QuickSearch className="mt-10" defaultLocation={page.locationId} />

      <section className="pt-20" aria-labelledby="cars-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="cars-heading" className="text-3xl font-semibold tracking-tighter sm:text-4xl">{page.carsHeading}</h2>
          <Link to="/fleet" className="btn-ghost hidden sm:inline-flex">Whole fleet</Link>
        </div>
        {list.length ? (
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((car, i) => (
              <CarCard key={car.id} car={car} available={isAvailable(car.id)} index={i} search={loc} weekly={page.weekly} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-border px-6 py-16 text-center">
            <p className="text-lg font-medium">None available right now</p>
            <p className="mt-1 text-muted-foreground">Call {business.phone} or browse the whole fleet.</p>
            <Link to="/fleet" className="btn-ghost mt-6">Whole fleet</Link>
          </div>
        )}
      </section>

      <section className="grid gap-10 pt-24 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="text-3xl font-semibold tracking-tighter">Questions</h2>
        <div className="divide-y divide-border border-y border-border">
          {page.faqs.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="-my-2 flex cursor-pointer list-none items-center justify-between gap-4 py-2 text-lg font-medium">
                {q}
                <span className="text-2xl leading-none text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-[60ch] leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
