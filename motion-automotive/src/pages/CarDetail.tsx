import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Wrench } from 'lucide-react'
import { CarImage } from '@/components/car-image'
import { CarSpecs } from '@/components/car-card'
import { useStore } from '@/store/store'
import { addDays, isoDate, money, prettyDate } from '@/lib/utils'
import NotFound from './NotFound'

export default function CarDetail() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const { getCar, isAvailable, reservations } = useStore()
  const car = getCar(id)
  if (!car || car.status === 'retired') return <NotFound />

  const today = isoDate(new Date())
  const from = params.get('from') ?? addDays(today, 1)
  const to = params.get('to') ?? addDays(from, 3)
  const loc = params.get('loc') ?? ''
  const free = isAvailable(car.id, from, to)
  const upcoming = reservations
    .filter((r) => r.carId === car.id && (r.status === 'confirmed' || r.status === 'picked-up') && r.dropoff >= today)
    .sort((a, b) => a.pickup.localeCompare(b.pickup))

  const setDate = (key: 'from' | 'to', v: string) => {
    const next = new URLSearchParams(params)
    next.set('from', from)
    next.set('to', to)
    next.set(key, v)
    if (key === 'from' && to <= v) next.set('to', addDays(v, 1))
    setParams(next, { replace: true })
  }

  return (
    <div className="container-page pt-4">
      <Link to="/fleet" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All cars
      </Link>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
        <div className="overflow-hidden rounded-3xl">
          <CarImage car={car} eager className="aspect-[4/3] w-full lg:aspect-[5/4]" />
        </div>

        <div className="flex flex-col">
          <p className="text-muted-foreground">{car.year} {car.make}</p>
          <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl">{car.model}</h1>
          <CarSpecs car={car} className="mt-4" />
          <p className="mt-3 text-sm text-muted-foreground">{car.transmission} &middot; {car.color}</p>

          <ul className="mt-6 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {car.features.map((f) => (
              <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" />{f}</li>
            ))}
          </ul>

          <div className="mt-8 rounded-3xl border border-border bg-card p-5">
            <p className="text-3xl font-semibold">{money(car.dailyRate)}<span className="text-base font-normal text-muted-foreground"> / day</span></p>
            {car.status === 'maintenance' ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Wrench className="h-4 w-4" /> In service right now. Check back soon.</p>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="grid gap-1.5">
                    <span className="field-label">From</span>
                    <input type="date" className="field" min={today} value={from} onChange={(e) => setDate('from', e.target.value)} />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="field-label">Until</span>
                    <input type="date" className="field" min={addDays(from, 1)} value={to} onChange={(e) => setDate('to', e.target.value)} />
                  </label>
                </div>
                {free ? (
                  <Link to={`/book/${car.id}?from=${from}&to=${to}${loc ? `&loc=${loc}` : ''}`} className="btn-signal mt-4 w-full py-3">
                    Reserve this car
                  </Link>
                ) : (
                  <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm" role="status">
                    Booked for part of those dates. Try different dates or <Link to={`/fleet?from=${from}&to=${to}`} className="font-medium underline underline-offset-4">see what is free</Link>.
                  </p>
                )}
              </>
            )}
          </div>

          {upcoming.length > 0 && (
            <div className="mt-6 text-sm">
              <p className="font-medium">Already booked</p>
              <ul className="mt-2 flex flex-wrap gap-2 text-muted-foreground">
                {upcoming.map((r) => (
                  <li key={r.code} className="rounded-full bg-muted px-3 py-1">{prettyDate(r.pickup)} to {prettyDate(r.dropoff)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
