import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { trackViewCar } from '@/lib/analytics'
import { ArrowLeft, Check, Wrench } from 'lucide-react'
import { CarImage } from '@/components/car-image'
import { CarSpecs } from '@/components/car-card'
import { DateRangeCalendar } from '@/components/date-range-calendar'
import { MobileActionBar } from '@/components/mobile-action-bar'
import { useStore } from '@/store/store'
import { business } from '@/config/business'
import { useSeo } from '@/lib/seo'
import { addDays, isoDate, money, prettyDate } from '@/lib/utils'
import NotFound from './NotFound'

export default function CarDetail() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const { getCar, isAvailable, reservations, bookedRanges } = useStore()
  const car = getCar(id)
  useSeo(
    car ? `Rent the ${car.year} ${car.make} ${car.model} in Baton Rouge | ${business.name}` : `Car not found | ${business.name}`,
    car ? `${car.year} ${car.make} ${car.model}: ${car.seats} seats, ${car.fuel.toLowerCase()}, from $${car.dailyRate} a day. Pick up in Baton Rouge with your own insurance or ours.` : 'This car is no longer listed.',
    `/fleet/${id}`,
    { noindex: !car },
  )
  useEffect(() => {
    if (car) trackViewCar(car)
    // Once per car, not on every date change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car?.id])
  if (!car || car.status === 'retired') return <NotFound />

  const today = isoDate(new Date())
  const from = params.get('from') ?? addDays(today, 1)
  const to = params.get('to') ?? addDays(from, 3)
  const loc = params.get('loc') ?? ''
  const free = isAvailable(car.id, from, to)
  const upcoming = reservations
    .filter((r) => r.carId === car.id && (r.status === 'confirmed' || r.status === 'picked-up') && r.dropoff >= today)
    .sort((a, b) => a.pickup.localeCompare(b.pickup))

  const setDates = (f: string, t: string) => {
    const next = new URLSearchParams(params)
    next.set('from', f)
    next.set('to', t)
    setParams(next, { replace: true })
  }

  return (
    <div className="container-page pt-4">
      <Link to="/fleet" className="-my-3 inline-flex items-center gap-1.5 py-3 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All cars
      </Link>

      <div className="mt-5 grid gap-10 lg:grid-cols-[1.35fr_1fr]">
        <div className="overflow-hidden rounded-3xl">
          <CarImage car={car} eager className="aspect-[4/3] w-full lg:aspect-[5/4]" />
        </div>

        <div className="flex min-w-0 flex-col">
          <p className="text-muted-foreground">{car.year} {car.make}</p>
          <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl">{car.model}</h1>
          <CarSpecs car={car} className="mt-4" />
          <p className="mt-3 text-sm text-muted-foreground">{car.transmission} &middot; {car.color}</p>

          <ul className="mt-6 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {car.features.map((f) => (
              <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-ok" />{f}</li>
            ))}
          </ul>

          <div id="reserve" className="mt-8 scroll-mt-20 rounded-3xl border border-border bg-card p-5">
            <p className="text-3xl font-semibold">{money(car.dailyRate)}<span className="text-base font-normal text-muted-foreground"> / day</span></p>
            {car.status === 'maintenance' ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Wrench className="h-4 w-4" /> In service right now. Check back soon.</p>
            ) : (
              <>
                <DateRangeCalendar className="mt-4" from={from} to={to} onChange={setDates} booked={bookedRanges(car.id)} />
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
      {car.status !== 'maintenance' && (
        <MobileActionBar watchId="reserve">
          <div className="min-w-0">
            <p className="font-semibold">{money(car.dailyRate)}<span className="text-sm font-normal text-muted-foreground"> / day</span></p>
            <p className="truncate text-sm text-muted-foreground">{prettyDate(from)} to {prettyDate(to)}</p>
          </div>
          {free ? (
            <Link to={`/book/${car.id}?from=${from}&to=${to}${loc ? `&loc=${loc}` : ''}`} className="btn-signal shrink-0 px-6 py-3">Reserve</Link>
          ) : (
            <a href="#reserve" className="btn-signal shrink-0 px-6 py-3">Change dates</a>
          )}
        </MobileActionBar>
      )}
    </div>
  )
}
