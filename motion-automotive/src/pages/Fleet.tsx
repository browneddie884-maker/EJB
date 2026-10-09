import { Link, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { CarCard } from '@/components/car-card'
import { categories } from '@/data/types'
import { useStore } from '@/store/store'
import { addDays, cn, isoDate, prettyDate } from '@/lib/utils'

export default function Fleet() {
  const { cars, isAvailable } = useStore()
  const [params, setParams] = useSearchParams()
  const type = params.get('type') ?? ''
  const make = params.get('make') ?? ''
  const fuel = params.get('fuel') ?? ''
  const seats = Number(params.get('seats') ?? 0)
  const sort = params.get('sort') ?? 'price-asc'
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
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
          <label className="grid gap-1.5">
            <span className="field-label">From</span>
            <input type="date" className="field" min={today} value={from} onChange={(e) => {
              const next = new URLSearchParams(params)
              next.set('from', e.target.value)
              if (!to || to <= e.target.value) next.set('to', addDays(e.target.value, 3))
              setParams(next, { replace: true })
            }} />
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Until</span>
            <input type="date" className="field" min={from ? addDays(from, 1) : today} value={to} onChange={(e) => set('to', e.target.value)} />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Car type">
        {['', ...categories].map((c) => (
          <button
            key={c || 'all'}
            onClick={() => set('type', c)}
            className={cn('btn px-4 py-2', type === c ? 'bg-foreground text-background' : 'border border-border hover:bg-muted')}
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

      <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
        <span>{results.length} {results.length === 1 ? 'car' : 'cars'}</span>
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

      {results.length ? (
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
