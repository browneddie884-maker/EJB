import { useCallback, useState } from 'react'
import { Link, useHref, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, LayoutGrid, SlidersHorizontal, X } from 'lucide-react'
import { CarCard, CarSpecs } from '@/components/car-card'
import { WorksWheel } from '@/components/ui/works-wheel'
import type { Car } from '@/data/types'
import { categories } from '@/data/types'
import { useStore } from '@/store/store'
import { business } from '@/config/business'
import { useSeo } from '@/lib/seo'
import { addDays, cn, isoDate, money, prettyDate } from '@/lib/utils'

const typeLabel: Record<string, string> = { Sedan: 'Sedans', SUV: 'SUVs', Truck: 'Trucks', Electric: 'Electric cars', Sports: 'Sports cars', Luxury: 'Luxury cars' }

/** Turn the wheel (scroll, drag or arrow keys) to bring a car to the front; click it to open. */
function FleetWheel({ results, label, carry }: { results: { car: Car; available: boolean }[]; label: string; carry: string }) {
  const navigate = useNavigate()
  const base = useHref('/fleet')
  const [active, setActive] = useState(0)
  const onActiveChange = useCallback((i: number) => setActive(i), [])
  const current = results[Math.min(active, results.length - 1)]

  return (
    <div className="mt-6">
      <div className="overflow-hidden rounded-3xl border border-border">
        <WorksWheel
          label={label}
          action="View car"
          className="h-[68vh] min-h-[460px] max-h-[760px] bg-card"
          items={results.map(({ car, available }) => ({
            title: `${car.make} ${car.model}${available ? '' : car.status === 'maintenance' ? ' (in service)' : ' (booked)'}`,
            image: car.image,
            href: `${base}/${car.id}${carry}`,
          }))}
          onSelect={(_, i) => navigate(`/fleet/${results[i].car.id}${carry}`)}
          onActiveChange={onActiveChange}
        />
      </div>
      {current && (
        <div className="mt-4 flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{current.car.year} {current.car.make} &middot; {current.car.category}</p>
            <p className="text-xl font-semibold tracking-tight">{current.car.model}</p>
            <CarSpecs car={current.car} className="mt-1" />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-right">
              <span className="text-2xl font-semibold">{money(current.car.dailyRate)}</span>
              <span className="block text-xs text-muted-foreground">per day</span>
            </p>
            <Link to={`/fleet/${current.car.id}${carry}`} className="btn-signal">
              View car <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
      <p className="mt-3 text-center text-sm text-muted-foreground">Scroll, drag or use the arrow keys to turn the wheel. The list on the right jumps to any car.</p>
    </div>
  )
}

export default function Fleet() {
  useSeo(`Rental Fleet: Cars, SUVs & Trucks | ${business.name}`, 'Browse every car, SUV, truck and EV we rent in Baton Rouge, check availability for your dates and book online.', '/fleet')
  const { cars, isAvailable } = useStore()
  const [params, setParams] = useSearchParams()
  const type = params.get('type') ?? ''
  const make = params.get('make') ?? ''
  const fuel = params.get('fuel') ?? ''
  const seats = Number(params.get('seats') ?? 0)
  const sort = params.get('sort') ?? 'price-asc'
  const view = params.get('view') ?? (window.matchMedia?.('(min-width: 768px)').matches ? 'wheel' : 'grid')
  const from = params.get('from') ?? ''
  const to = params.get('to') ?? ''
  const today = isoDate(new Date())

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const listed = cars.filter((c) => c.status !== 'retired')
  const makes = [...new Set(listed.map((c) => c.make))].sort()

  const results = (() => {
    const out = listed
      .filter((c) => (!type || c.category === type) && (!make || c.make === make) && (!fuel || c.fuel === fuel) && c.seats >= seats)
      .map((c) => ({ car: c, available: isAvailable(c.id, from || undefined, to || undefined) }))
    out.sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1
      return sort === 'price-desc' ? b.car.dailyRate - a.car.dailyRate : a.car.dailyRate - b.car.dailyRate
    })
    return out
  })()

  const carryParams = from && to ? `?from=${from}&to=${to}${params.get('loc') ? `&loc=${params.get('loc')}` : ''}` : ''
  const hasFilters = type || make || fuel || seats

  return (
    <div className="container-page pt-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl">The fleet</h1>
          <p className="mt-2 text-muted-foreground">
            {from && to ? `Showing availability for ${prettyDate(from)} to ${prettyDate(to)}.` : 'Add your dates to see what is free.'}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:flex sm:items-end">
          <label className="grid min-w-0 gap-1.5">
            <span className="field-label">From</span>
            <input type="date" className="field min-w-0" min={today} value={from} onChange={(e) => {
              const next = new URLSearchParams(params)
              next.set('from', e.target.value)
              if (!to || to <= e.target.value) next.set('to', addDays(e.target.value, 3))
              setParams(next, { replace: true })
            }} />
          </label>
          <label className="grid min-w-0 gap-1.5">
            <span className="field-label">Until</span>
            <input type="date" className="field min-w-0" min={from ? addDays(from, 1) : today} value={to} onChange={(e) => set('to', e.target.value)} />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Car type">
        {['', ...categories].map((c) => (
          <button
            key={c || 'all'}
            onClick={() => set('type', c)}
            className={cn('btn px-4 py-2.5 sm:py-2', type === c ? 'bg-foreground text-background' : 'border border-border hover:bg-muted')}
            aria-pressed={type === c}
          >
            {c || 'All types'}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <label className="grid gap-1.5">
          <span className="field-label">Make</span>
          <select className="field" value={make} onChange={(e) => set('make', e.target.value)}>
            <option value="">Any make</option>
            {makes.map((m) => <option key={m}>{m}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="field-label">Fuel</span>
          <select className="field" value={fuel} onChange={(e) => set('fuel', e.target.value)}>
            <option value="">Any fuel</option>
            <option>Gas</option>
            <option>Hybrid</option>
            <option>Electric</option>
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="field-label">Seats</span>
          <select className="field" value={seats || ''} onChange={(e) => set('seats', e.target.value)}>
            <option value="">Any</option>
            <option value="4">4 or more</option>
            <option value="5">5 or more</option>
            <option value="7">7 or more</option>
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="field-label">Sort</span>
          <select className="field" value={sort} onChange={(e) => set('sort', e.target.value)}>
            <option value="price-asc">Price, low to high</option>
            <option value="price-desc">Price, high to low</option>
          </select>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{results.length} {results.length === 1 ? 'car' : 'cars'}</span>
          <div className="flex rounded-full border border-border p-0.5" role="group" aria-label="View">
            {(['wheel', 'grid'] as const).map((v) => (
              <button key={v} onClick={() => set('view', v)} aria-pressed={view === v} className={cn('flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm capitalize transition-colors sm:px-3 sm:py-1', view === v ? 'bg-foreground text-background' : 'hover:text-foreground')}>
                {v === 'grid' && <LayoutGrid className="h-3.5 w-3.5" />}
                {v}
              </button>
            ))}
          </div>
        </div>
        {hasFilters ? (
          <button className="flex items-center gap-1 hover:text-foreground" onClick={() => {
            const next = new URLSearchParams()
            if (from) next.set('from', from)
            if (to) next.set('to', to)
            setParams(next, { replace: true })
          }}>
            <X className="h-4 w-4" /> Clear filters
          </button>
        ) : null}
      </div>

      {results.length && view === 'wheel' ? (
        <FleetWheel key={`${type}-${make}-${fuel}-${seats}-${sort}`} results={results} carry={carryParams} label={type ? typeLabel[type] ?? type : make || 'The fleet'} />
      ) : results.length ? (
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ car, available }, i) => (
            <CarCard key={car.id} car={car} available={available} search={carryParams} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-20 text-center">
          <SlidersHorizontal className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-4 text-lg font-medium">No cars match those filters</p>
          <p className="mt-1 text-muted-foreground">Try another make or type, or clear the filters.</p>
          <Link to="/fleet" className="btn-ghost mt-6">Show every car</Link>
        </div>
      )}
    </div>
  )
}
