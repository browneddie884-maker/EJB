import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CalendarCheck, CircleCheck } from 'lucide-react'
import { CarImage } from '@/components/car-image'
import { DateRangeCalendar } from '@/components/date-range-calendar'
import { PriceSummary } from '@/components/price-summary'
import { business, coveragePlans, extras } from '@/config/business'
import type { Reservation } from '@/data/types'
import { quote } from '@/lib/pricing'
import { money, prettyDate } from '@/lib/utils'
import { useStore } from '@/store/store'

export function ReservationLookup() {
  const { findReservation } = useStore()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')

  function submit(e: FormEvent) {
    e.preventDefault()
    const r = findReservation(code, lastName)
    if (!r) {
      setError('We could not find a booking with that code and last name.')
      return
    }
    navigate(`/reservations/${r.code}`)
  }

  return (
    <div className="container-page grid gap-12 pt-6 lg:grid-cols-2">
      <div>
        <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl">Find your booking</h1>
        <p className="mt-3 max-w-[44ch] leading-relaxed text-muted-foreground">
          Use the code from your confirmation to change dates or cancel. Need help? Call {business.phone}.
        </p>
      </div>
      <form onSubmit={submit} noValidate className="grid gap-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <label className="grid gap-1.5">
          <span className="field-label">Booking code</span>
          <input className="field uppercase" placeholder="MA-XXXXXX" value={code} onChange={(e) => setCode(e.target.value)} required />
        </label>
        <label className="grid gap-1.5">
          <span className="field-label">Driver last name</span>
          <input className="field" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </label>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="btn-solid mt-2 py-3">Look up booking</button>
      </form>
    </div>
  )
}

const statusText: Record<Reservation['status'], string> = {
  confirmed: 'Confirmed',
  'picked-up': 'On the road',
  returned: 'Returned',
  cancelled: 'Cancelled',
}

export function ReservationDetail() {
  const { code = '' } = useParams()
  const [params] = useSearchParams()
  const { reservations, getCar, isAvailable, bookedRanges, updateReservation, setReservationStatus } = useStore()
  const r = reservations.find((x) => x.code === code)
  const [editing, setEditing] = useState(false)
  const [from, setFrom] = useState(r?.pickup ?? '')
  const [to, setTo] = useState(r?.dropoff ?? '')
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!r) {
    return (
      <div className="container-page py-20">
        <h1 className="text-3xl font-semibold tracking-tighter">Booking not found</h1>
        <Link to="/reservations" className="btn-solid mt-6">Look up a booking</Link>
      </div>
    )
  }
  const car = getCar(r.carId)
  const hoursToPickup = (new Date(r.pickup + 'T09:00:00').getTime() - Date.now()) / 3_600_000
  const freeCancel = hoursToPickup >= business.freeCancellationHours
  const canChange = r.status === 'confirmed'
  const loc = business.locations.find((l) => l.id === r.locationId)
  const newDatesFree = car ? isAvailable(car.id, from, to, r.code) : false
  const newQuote = car && to > from ? quote({ car, pickup: from, dropoff: to, insurance: r.insurance, extras: r.extras, locationId: r.locationId, driverAge: r.driver.age }) : null

  return (
    <div className="container-page pt-6">
      {params.get('new') && (
        <div className="mb-8 flex items-start gap-3 rounded-3xl bg-foreground p-5 text-background sm:items-center">
          <CircleCheck className="h-6 w-6 shrink-0 text-signal" />
          <p>You're booked. Save this code: you'll need it with your last name to change or cancel.</p>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-muted-foreground">Booking code</p>
          <p className="mt-1 inline-block rounded-xl border-2 border-foreground px-4 py-1.5 font-mono text-3xl font-semibold tracking-widest sm:text-4xl">{r.code}</p>
          <p className="mt-4 text-sm font-medium">{statusText[r.status]}</p>

          {car && (
            <div className="mt-8 flex flex-col gap-5 sm:flex-row">
              <CarImage car={car} className="aspect-[4/3] w-full rounded-3xl sm:w-64" />
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight">{car.year} {car.make} {car.model}</h1>
                <p className="flex items-center gap-2 text-muted-foreground"><CalendarCheck className="h-4 w-4" />{prettyDate(r.pickup)} to {prettyDate(r.dropoff)}</p>
                <p className="text-muted-foreground">{loc?.name}{loc?.address && loc.id !== 'delivery' ? `, ${loc.address}` : ''}</p>
              </div>
            </div>
          )}

          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Insurance</dt>
              <dd className="mt-1 font-medium">
                {r.insurance.type === 'motion'
                  ? `Motion ${coveragePlans.find((p) => p.id === (r.insurance as { plan: string }).plan)?.name} coverage`
                  : `${r.insurance.carrier}, policy ${r.insurance.policyNumber}`}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Driver</dt>
              <dd className="mt-1 font-medium">{r.driver.firstName} {r.driver.lastName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Extras</dt>
              <dd className="mt-1 font-medium">{r.extras.length ? r.extras.map((id) => extras.find((x) => x.id === id)?.name).join(', ') : 'None'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Total, paid at pickup</dt>
              <dd className="mt-1 font-medium">{money(r.total)} <span className="font-normal text-muted-foreground">+ {money(r.deposit)} hold</span></dd>
            </div>
          </dl>
        </div>

        {canChange && (
          <div className="self-start rounded-3xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Manage booking</h2>
            {editing ? (
              <div className="mt-4 space-y-4">
                <DateRangeCalendar from={from} to={to} booked={bookedRanges(r.carId, r.code)} onChange={(f, t) => { setFrom(f); setTo(t) }} />
                {!newDatesFree && <p className="field-error">The car is booked for part of those dates.</p>}
                {newQuote && newDatesFree && <PriceSummary q={newQuote} />}
                <div className="flex gap-2">
                  <button className="btn-solid" disabled={!newDatesFree || !newQuote} onClick={() => {
                    updateReservation(r.code, { pickup: from, dropoff: to, total: newQuote!.total })
                    setEditing(false)
                  }}>Save dates</button>
                  <button className="btn-ghost" onClick={() => { setEditing(false); setFrom(r.pickup); setTo(r.dropoff) }}>Keep current dates</button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-ghost" onClick={() => setEditing(true)}>Change dates</button>
                <button className="btn-ghost text-danger" onClick={() => setConfirmCancel(true)}>Cancel booking</button>
              </div>
            )}
            {confirmCancel && !editing && (
              <div className="mt-5 rounded-2xl bg-muted p-4 text-sm" role="alertdialog" aria-label="Confirm cancellation">
                <p>{freeCancel ? 'Cancelling is free at this point.' : `Pickup is less than ${business.freeCancellationHours} hours away, so a one-day charge of ${car ? money(car.dailyRate) : ''} applies.`}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn bg-danger text-background" onClick={() => { setReservationStatus(r.code, 'cancelled'); setConfirmCancel(false) }}>Yes, cancel it</button>
                  <button className="btn-ghost" onClick={() => setConfirmCancel(false)}>Keep booking</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
