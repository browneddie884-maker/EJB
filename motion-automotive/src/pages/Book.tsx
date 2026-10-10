import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, FileText, ShieldCheck } from 'lucide-react'
import { CarImage } from '@/components/car-image'
import { DateRangeCalendar } from '@/components/date-range-calendar'
import { PriceSummary } from '@/components/price-summary'
import { business, coveragePlans, extras, type CoveragePlanId } from '@/config/business'
import type { Driver, Insurance } from '@/data/types'
import { quote } from '@/lib/pricing'
import { currentSource, trackBeginBooking, trackBooking } from '@/lib/analytics'
import { addDays, cn, isoDate, money, prettyDate } from '@/lib/utils'
import { useStore } from '@/store/store'
import NotFound from './NotFound'

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="border-t border-border pt-8" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="flex items-center gap-3 text-xl font-semibold tracking-tight">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-sm text-background">{n}</span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="grid content-start gap-1.5">
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

type Errors = Partial<Record<string, string>>

export default function Book() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { getCar, isAvailable, bookedRanges, createReservation } = useStore()
  const car = getCar(id)
  const today = isoDate(new Date())

  const [from, setFrom] = useState(params.get('from') ?? addDays(today, 1))
  const [to, setTo] = useState(params.get('to') ?? addDays(params.get('from') ?? addDays(today, 1), 3))
  const [locationId, setLocationId] = useState(params.get('loc') ?? business.locations[0].id)
  const [insuranceType, setInsuranceType] = useState<'own' | 'motion'>('motion')
  const [plan, setPlan] = useState<CoveragePlanId>('standard')
  const [own, setOwn] = useState({ carrier: '', policyNumber: '', expires: '' })
  const [ownConfirmed, setOwnConfirmed] = useState(false)
  const [chosenExtras, setChosenExtras] = useState<string[]>([])
  const [driver, setDriver] = useState<Driver>({ firstName: '', lastName: '', email: '', phone: '', licenseNumber: '', licenseState: '', age: 30 })
  const [agree, setAgree] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const insurance: Insurance = insuranceType === 'own' ? { type: 'own', ...own } : { type: 'motion', plan }
  const q = useMemo(
    () => (car ? quote({ car, pickup: from, dropoff: to, insurance, extras: chosenExtras, locationId, driverAge: driver.age }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [car, from, to, insuranceType, plan, chosenExtras, locationId, driver.age],
  )

  // Report the start of checkout once per visit to this page.
  const reported = useRef(false)
  useEffect(() => {
    if (car && q && !reported.current) {
      reported.current = true
      trackBeginBooking(car, q.total)
    }
  }, [car, q])

  if (!car || car.status === 'retired') return <NotFound />
  const free = isAvailable(car.id, from, to)
  // Errors appear after the first submit attempt, then update live as fields are fixed.
  const errors: Errors = submitted ? validate() : {}

  function validate(): Errors {
    const e: Errors = {}
    if (to <= from) e.to = 'Return date must be after pickup.'
    if (from < today) e.from = 'Pickup cannot be in the past.'
    if (!free) e.to = 'This car is booked for part of those dates.'
    if (insuranceType === 'own') {
      if (!own.carrier.trim()) e.carrier = 'Enter your insurance company.'
      if (!own.policyNumber.trim()) e.policyNumber = 'Enter your policy number.'
      if (!own.expires) e.expires = 'Enter the expiry date.'
      else if (own.expires < to) e.expires = 'Your policy must be active for the whole rental.'
      if (!ownConfirmed) e.ownConfirmed = 'Please confirm your policy covers rentals.'
    }
    if (!driver.firstName.trim()) e.firstName = 'Required.'
    if (!driver.lastName.trim()) e.lastName = 'Required.'
    if (!/^\S+@\S+\.\S+$/.test(driver.email)) e.email = 'Enter a valid email.'
    if (driver.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a 10 digit phone number.'
    if (!driver.licenseNumber.trim()) e.licenseNumber = 'Required.'
    if (!driver.licenseState.trim()) e.licenseState = 'Required.'
    if (!driver.age || driver.age < business.minDriverAge) e.age = `Drivers must be ${business.minDriverAge} or older.`
    if (!agree) e.agree = 'Please accept the rental terms.'
    return e
  }

  function submit(ev: FormEvent) {
    ev.preventDefault()
    setSubmitted(true)
    if (Object.keys(validate()).length) {
      requestAnimationFrame(() => document.querySelector('.field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
      return
    }
    const r = createReservation({
      carId: car!.id, pickup: from, dropoff: to, locationId, insurance, extras: chosenExtras,
      driver: { ...driver, firstName: driver.firstName.trim(), lastName: driver.lastName.trim() },
      total: q!.total, deposit: q!.deposit, source: currentSource(),
    })
    trackBooking(r, car!)
    navigate(`/reservations/${r.code}?new=1`)
  }

  const d = (k: keyof Driver) => ({
    value: driver[k],
    'aria-invalid': !!errors[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDriver({ ...driver, [k]: k === 'age' ? Number(e.target.value) : e.target.value }),
  })
  const planName = coveragePlans.find((p) => p.id === plan)?.name

  return (
    <div className="container-page pt-4">
      <Link to={`/fleet/${car.id}?from=${from}&to=${to}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to car
      </Link>
      <h1 className="mt-4 text-4xl font-semibold tracking-tighter sm:text-5xl">Reserve your {car.make} {car.model}</h1>

      <form onSubmit={submit} noValidate className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-12">
          <Step n={1} title="Trip">
            <div className="grid gap-6">
              <DateRangeCalendar from={from} to={to} months={2} booked={bookedRanges(car.id)} onChange={(f, t) => { setFrom(f); setTo(t) }} />
              {(errors.from || errors.to || !free) && <p className="field-error">{errors.from ?? errors.to ?? 'This car is booked for part of those dates.'}</p>}
              <div className="sm:max-w-sm">
                <Field label="Pickup location" hint={business.locations.find((l) => l.id === locationId)?.address || undefined}>
                <select className="field" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                  {business.locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
              </Field>
              </div>
            </div>
          </Step>

          <Step n={2} title="Insurance">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Insurance choice">
              {([
                ['motion', ShieldCheck, 'Motion coverage', `From ${money(coveragePlans[0].perDay)}/day, ${money(business.deposit.motionCoverage)} hold`],
                ['own', FileText, 'My own insurance', `No coverage charge, ${money(business.deposit.ownInsurance)} hold`],
              ] as const).map(([value, Icon, title, sub]) => (
                <button
                  type="button" key={value} role="radio" aria-checked={insuranceType === value}
                  onClick={() => setInsuranceType(value)}
                  className={cn('flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors', insuranceType === value ? 'border-foreground bg-card ring-1 ring-foreground' : 'border-border hover:bg-muted')}
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.75} />
                  <span>
                    <span className="block font-medium">{title}</span>
                    <span className="block text-sm text-muted-foreground">{sub}</span>
                  </span>
                </button>
              ))}
            </div>

            {insuranceType === 'motion' ? (
              <div className="mt-6 grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Coverage plan">
                {coveragePlans.map((p) => (
                  <button
                    type="button" key={p.id} role="radio" aria-checked={plan === p.id} onClick={() => setPlan(p.id)}
                    className={cn('flex flex-col rounded-2xl border p-4 text-left transition-colors', plan === p.id ? 'border-signal bg-card ring-1 ring-signal' : 'border-border hover:bg-muted')}
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-medium">{p.name}</span>
                      <span className="font-semibold">{money(p.perDay)}<span className="text-xs font-normal text-muted-foreground">/day</span></span>
                    </span>
                    <span className="mt-1 text-sm text-muted-foreground">{p.summary}</span>
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {p.includes.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok" />{i}</li>)}
                    </ul>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Field label="Insurance company" error={errors.carrier}>
                  <input className="field" autoComplete="off" value={own.carrier} aria-invalid={!!errors.carrier} onChange={(e) => setOwn({ ...own, carrier: e.target.value })} />
                </Field>
                <Field label="Policy number" error={errors.policyNumber}>
                  <input className="field" autoComplete="off" value={own.policyNumber} aria-invalid={!!errors.policyNumber} onChange={(e) => setOwn({ ...own, policyNumber: e.target.value })} />
                </Field>
                <Field label="Policy expires" error={errors.expires}>
                  <input type="date" className="field" min={today} value={own.expires} aria-invalid={!!errors.expires} onChange={(e) => setOwn({ ...own, expires: e.target.value })} />
                </Field>
                <label className="flex gap-3 text-sm sm:col-span-3">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--signal)]" checked={ownConfirmed} onChange={(e) => setOwnConfirmed(e.target.checked)} />
                  <span>
                    My policy includes collision and liability coverage that extends to rental cars, and I will bring my insurance card to pickup.
                    {errors.ownConfirmed && <span className="field-error mt-1 block">{errors.ownConfirmed}</span>}
                  </span>
                </label>
              </div>
            )}
          </Step>

          <Step n={3} title="Extras">
            <div className="flex flex-wrap gap-2">
              {extras.map((x) => {
                const on = chosenExtras.includes(x.id)
                return (
                  <button
                    type="button" key={x.id} aria-pressed={on}
                    onClick={() => setChosenExtras(on ? chosenExtras.filter((i) => i !== x.id) : [...chosenExtras, x.id])}
                    className={cn('btn', on ? 'bg-foreground text-background' : 'border border-border hover:bg-muted')}
                  >
                    {on && <Check className="h-4 w-4" />}
                    {x.name}
                    <span className={cn('text-xs', on ? 'opacity-80' : 'text-muted-foreground')}>{x.perDay ? `${money(x.perDay)}/day` : money(x.flat!)}</span>
                  </button>
                )
              })}
            </div>
          </Step>

          <Step n={4} title="Driver">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" error={errors.firstName}><input className="field" autoComplete="given-name" {...d('firstName')} /></Field>
              <Field label="Last name" error={errors.lastName}><input className="field" autoComplete="family-name" {...d('lastName')} /></Field>
              <Field label="Email" error={errors.email}><input type="email" className="field" autoComplete="email" {...d('email')} /></Field>
              <Field label="Phone" error={errors.phone}><input type="tel" className="field" autoComplete="tel" {...d('phone')} /></Field>
              <Field label="Driver's license number" error={errors.licenseNumber}><input className="field" autoComplete="off" {...d('licenseNumber')} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="License state" error={errors.licenseState}><input className="field" maxLength={2} placeholder="TX" {...d('licenseState')} /></Field>
                <Field label="Driver age" error={errors.age} hint={driver.age < business.youngDriverAge ? `Under ${business.youngDriverAge}: ${money(business.youngDriverFeePerDay)}/day fee` : undefined}>
                  <input type="number" className="field" min={16} max={99} {...d('age')} />
                </Field>
              </div>
            </div>
          </Step>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="flex gap-4">
              <CarImage car={car} className="h-16 w-24 shrink-0 rounded-xl" />
              <div>
                <p className="font-medium">{car.make} {car.model}</p>
                <p className="text-sm text-muted-foreground">{prettyDate(from)} to {prettyDate(to)}</p>
              </div>
            </div>
            <div className="mt-5 border-t border-border pt-5">
              {q && <PriceSummary q={q} coverageLabel={insuranceType === 'motion' ? `${planName} coverage` : 'Coverage'} />}
            </div>
            <label className="mt-5 flex gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--signal)]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                I agree to the rental terms. Free cancellation up to {business.freeCancellationHours} hours before pickup.
                {errors.agree && <span className="field-error mt-1 block">{errors.agree}</span>}
              </span>
            </label>
            <button type="submit" className="btn-signal mt-5 w-full py-3" disabled={!free}>Confirm booking</button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Nothing is charged now. You pay at pickup.</p>
          </div>
        </aside>
      </form>
    </div>
  )
}
