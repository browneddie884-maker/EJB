import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { CarImage } from '@/components/car-image'
import { business, coveragePlans } from '@/config/business'
import { describeSource } from '@/lib/analytics'
import { categories, type Car, type CarStatus, type ReservationStatus } from '@/data/types'
import { cn, isoDate, money, prettyDate } from '@/lib/utils'
import { useStore } from '@/store/store'
import { useSeo } from '@/lib/seo'

/**
 * Staff area. The PIN gate is a demo convenience only, not real security:
 * before launch, put this behind real authentication on the backend.
 */
// Only a SHA-256 fingerprint of the PIN ships to the browser, never the PIN itself.
// Set VITE_STAFF_PIN_HASH to sha256("motion-staff:" + newPin) to change it. This is still a
// browser-side lock: replace it with real staff accounts when bookings move to a database.
const PIN_HASH = (import.meta.env.VITE_STAFF_PIN_HASH as string | undefined) ?? 'fa37fe8c62105f2e0622370cfbdbea3ded2241cbbf44ba5a8423113cebb81225'
const SHOW_DEMO_PIN = import.meta.env.DEV || import.meta.env.VITE_DEMO === '1'

async function pinMatches(pin: string) {
  const bytes = new TextEncoder().encode(`motion-staff:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return hex === PIN_HASH
}

const emptyCar: Car = {
  id: '', make: '', model: '', year: new Date().getFullYear(), category: 'Sedan', seats: 5, bags: 2,
  transmission: 'Automatic', fuel: 'Gas', dailyRate: 60, image: '', color: '', plate: '', mileage: 0,
  status: 'available', features: [],
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function CarForm({ initial, onSave, onCancel }: { initial: Car; onSave: (c: Car) => void; onCancel: () => void }) {
  const [car, setCar] = useState<Car>(initial)
  const [features, setFeatures] = useState(initial.features.join(', '))
  const [error, setError] = useState('')
  const { cars } = useStore()
  const set = <K extends keyof Car>(k: K, v: Car[K]) => setCar({ ...car, [k]: v })

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!car.make.trim() || !car.model.trim()) return setError('Make and model are required.')
    if (car.dailyRate <= 0) return setError('Daily rate must be more than zero.')
    let id = car.id
    if (!id) {
      id = slug(`${car.make}-${car.model}`)
      let n = 2
      while (cars.some((c) => c.id === id)) id = slug(`${car.make}-${car.model}-${n++}`)
    }
    onSave({ ...car, id, features: features.split(',').map((f) => f.trim()).filter(Boolean) })
  }

  const text = (label: string, k: 'make' | 'model' | 'color' | 'plate' | 'image', props: Record<string, unknown> = {}) => (
    <label className="grid gap-1.5">
      <span className="field-label">{label}</span>
      <input className="field" value={car[k]} onChange={(e) => set(k, e.target.value)} {...props} />
    </label>
  )
  const num = (label: string, k: 'year' | 'seats' | 'bags' | 'dailyRate' | 'mileage') => (
    <label className="grid gap-1.5">
      <span className="field-label">{label}</span>
      <input type="number" className="field" value={car[k]} onChange={(e) => set(k, Number(e.target.value))} />
    </label>
  )

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
      {text('Make', 'make', { required: true })}
      {text('Model', 'model', { required: true })}
      {num('Year', 'year')}
      {num('Daily rate ($)', 'dailyRate')}
      <label className="grid gap-1.5">
        <span className="field-label">Type</span>
        <select className="field" value={car.category} onChange={(e) => set('category', e.target.value as Car['category'])}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className="grid gap-1.5">
        <span className="field-label">Fuel</span>
        <select className="field" value={car.fuel} onChange={(e) => set('fuel', e.target.value as Car['fuel'])}>
          <option>Gas</option><option>Hybrid</option><option>Electric</option>
        </select>
      </label>
      {num('Seats', 'seats')}
      {num('Bags', 'bags')}
      {text('Color', 'color')}
      {text('Plate', 'plate')}
      {num('Mileage', 'mileage')}
      <label className="grid gap-1.5">
        <span className="field-label">Transmission</span>
        <select className="field" value={car.transmission} onChange={(e) => set('transmission', e.target.value as Car['transmission'])}>
          <option>Automatic</option><option>Manual</option>
        </select>
      </label>
      <div className="sm:col-span-2">{text('Photo URL', 'image', { placeholder: '/fleet/camry.jpg or https://...' })}</div>
      <label className="grid gap-1.5 sm:col-span-2">
        <span className="field-label">Features, comma separated</span>
        <input className="field" value={features} onChange={(e) => setFeatures(e.target.value)} />
      </label>
      {error && <p className="field-error sm:col-span-2 lg:col-span-4">{error}</p>}
      <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
        <button className="btn-solid">Save car</button>
        <button type="button" className="btn-ghost" onClick={onCancel}>Discard changes</button>
      </div>
    </form>
  )
}

function Inventory() {
  const { cars, reservations, upsertCar, removeCar } = useStore()
  const [editing, setEditing] = useState<Car | null>(null)
  const [armed, setArmed] = useState<string | null>(null)
  const today = isoDate(new Date())
  const outNow = (id: string) => reservations.some((r) => r.carId === id && r.status === 'picked-up')
  const nextBooking = (id: string) =>
    reservations
      .filter((r) => r.carId === id && r.status === 'confirmed' && r.pickup >= today)
      .sort((a, b) => a.pickup.localeCompare(b.pickup))[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{cars.length} vehicles</p>
        <button className="btn-signal" onClick={() => setEditing(emptyCar)}><Plus className="h-4 w-4" /> Add vehicle</button>
      </div>
      {editing && <CarForm key={editing.id || 'new'} initial={editing} onCancel={() => setEditing(null)} onSave={(c) => { upsertCar(c); setEditing(null) }} />}
      <ul className="space-y-3 md:hidden">
        {cars.map((c) => {
          const next = nextBooking(c.id)
          return (
            <li key={c.id} className={cn('rounded-3xl border border-border bg-card p-4 text-sm', c.status === 'retired' && 'opacity-55')}>
              <div className="flex items-center gap-3">
                <CarImage car={c} className="h-12 w-16 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.year} {c.make} {c.model}</p>
                  <p className="text-muted-foreground">{money(c.dailyRate)}/day, {c.plate || 'no plate'}</p>
                </div>
              </div>
              <p className="mt-3 text-muted-foreground">
                Next booking: {outNow(c.id) ? <span className="font-medium text-foreground">Out now</span> : next ? prettyDate(next.pickup) : 'None'}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <select className="field flex-1" value={c.status} onChange={(e) => upsertCar({ ...c, status: e.target.value as CarStatus })} aria-label={`Status of ${c.make} ${c.model}`}>
                  <option value="available">Available</option>
                  <option value="maintenance">In service</option>
                  <option value="retired">Hidden</option>
                </select>
                <button className="rounded-full p-3.5 hover:bg-muted" aria-label={`Edit ${c.model}`} onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></button>
                {armed === c.id ? (
                  <button className="btn bg-danger px-4 py-3 text-background" onClick={() => { removeCar(c.id); setArmed(null) }} onBlur={() => setArmed(null)} autoFocus>Delete</button>
                ) : (
                  <button className="rounded-full p-3.5 text-danger hover:bg-muted" aria-label={`Delete ${c.model}`} onClick={() => setArmed(c.id)}><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      <div className="hidden overflow-x-auto rounded-3xl border border-border md:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Vehicle</th>
              <th className="px-4 py-3 font-medium">Plate</th>
              <th className="px-4 py-3 font-medium">Rate</th>
              <th className="px-4 py-3 font-medium">Next booking</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cars.map((c) => {
              const next = nextBooking(c.id)
              return (
                <tr key={c.id} className={cn(c.status === 'retired' && 'opacity-55')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CarImage car={c} className="h-10 w-14 shrink-0 rounded-lg" />
                      <div>
                        <p className="font-medium">{c.year} {c.make} {c.model}</p>
                        <p className="text-muted-foreground">{c.category}, {c.mileage.toLocaleString()} mi</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono">{c.plate || '-'}</td>
                  <td className="px-4 py-3">{money(c.dailyRate)}</td>
                  <td className="px-4 py-3">{outNow(c.id) ? <span className="font-medium">Out now</span> : next ? prettyDate(next.pickup) : <span className="text-muted-foreground">None</span>}</td>
                  <td className="px-4 py-3">
                    <select className="field py-1.5" value={c.status} onChange={(e) => upsertCar({ ...c, status: e.target.value as CarStatus })} aria-label={`Status of ${c.make} ${c.model}`}>
                      <option value="available">Available</option>
                      <option value="maintenance">In service</option>
                      <option value="retired">Hidden</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-full p-2 hover:bg-muted" aria-label={`Edit ${c.model}`} onClick={() => setEditing(c)}><Pencil className="h-4 w-4" /></button>
                      {armed === c.id ? (
                        <button className="btn bg-danger px-3 py-1.5 text-background" onClick={() => { removeCar(c.id); setArmed(null) }} onBlur={() => setArmed(null)} autoFocus>Delete</button>
                      ) : (
                        <button className="rounded-full p-2 text-danger hover:bg-muted" aria-label={`Delete ${c.model}`} onClick={() => setArmed(c.id)}><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Bookings() {
  const { reservations, getCar, setReservationStatus } = useStore()
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming')
  const list = reservations
    .filter((r) => filter === 'all' || r.status === 'confirmed' || r.status === 'picked-up')
    .sort((a, b) => a.pickup.localeCompare(b.pickup))

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['upcoming', 'all'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('btn px-4 py-2', filter === f ? 'bg-foreground text-background' : 'border border-border hover:bg-muted')}>
            {f === 'upcoming' ? 'Active and upcoming' : 'All bookings'}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-lg font-medium">No bookings yet</p>
          <p className="mt-1 text-muted-foreground">New reservations from the website show up here.</p>
          <Link to="/fleet" className="btn-ghost mt-6">Open the fleet</Link>
        </div>
      ) : (
        <>
        {/* Phones: one card per booking instead of a wide table. */}
        <ul className="space-y-3 md:hidden">
          {list.map((r) => {
            const car = getCar(r.carId)
            return (
              <li key={r.code} className="rounded-3xl border border-border bg-card p-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{r.driver.firstName} {r.driver.lastName}</p>
                    <a href={`tel:${r.driver.phone.replace(/[^\d+]/g, '')}`} className="-my-2 inline-block py-2 text-muted-foreground underline underline-offset-4">{r.driver.phone}</a>
                  </div>
                  <Link className="-my-2 shrink-0 py-2 font-mono underline underline-offset-4" to={`/reservations/${r.code}`}>{r.code}</Link>
                </div>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                  <dt className="text-muted-foreground">Vehicle</dt><dd>{car ? `${car.make} ${car.model}` : 'Removed'}</dd>
                  <dt className="text-muted-foreground">Dates</dt><dd>{prettyDate(r.pickup)} to {prettyDate(r.dropoff)}</dd>
                  <dt className="text-muted-foreground">Pickup</dt><dd>{business.locations.find((l) => l.id === r.locationId)?.name ?? 'Not set'}</dd>
                  <dt className="text-muted-foreground">Insurance</dt>
                  <dd>
                    {r.insurance.type === 'own'
                      ? `Own: ${r.insurance.carrier}, #${r.insurance.policyNumber}, exp ${r.insurance.expires}`
                      : `Motion ${coveragePlans.find((p) => r.insurance.type === 'motion' && p.id === r.insurance.plan)?.name ?? ''}`}
                  </dd>
                  <dt className="text-muted-foreground">Came from</dt><dd>{describeSource(r.source)}</dd>
                  <dt className="text-muted-foreground">Total</dt><dd className="font-medium">{money(r.total)}</dd>
                </dl>
                <select className="field mt-3" value={r.status} onChange={(e) => setReservationStatus(r.code, e.target.value as ReservationStatus)} aria-label={`Status of ${r.code}`}>
                  <option value="confirmed">Confirmed</option>
                  <option value="picked-up">Picked up</option>
                  <option value="returned">Returned</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </li>
            )
          })}
        </ul>
        <div className="hidden overflow-x-auto rounded-3xl border border-border md:block">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Pickup</th>
                <th className="px-4 py-3 font-medium">Came from</th>
                <th className="px-4 py-3 font-medium">Insurance</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((r) => {
                const car = getCar(r.carId)
                return (
                  <tr key={r.code}>
                    <td className="px-4 py-3 font-mono"><Link className="underline underline-offset-4" to={`/reservations/${r.code}`}>{r.code}</Link></td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.driver.firstName} {r.driver.lastName}</p>
                      <p className="text-muted-foreground">{r.driver.phone}</p>
                    </td>
                    <td className="px-4 py-3">{car ? `${car.make} ${car.model}` : 'Removed'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{prettyDate(r.pickup)} to {prettyDate(r.dropoff)}</td>
                    <td className="px-4 py-3">{business.locations.find((l) => l.id === r.locationId)?.name ?? 'Not set'}</td>
                    <td className="px-4 py-3">{describeSource(r.source)}</td>
                    <td className="px-4 py-3">
                      {r.insurance.type === 'own' ? (
                        <><p className="font-medium">Own: {r.insurance.carrier}</p><p className="text-muted-foreground">#{r.insurance.policyNumber}, exp {r.insurance.expires}</p></>
                      ) : (
                        <p>Motion {coveragePlans.find((p) => r.insurance.type === 'motion' && p.id === r.insurance.plan)?.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{money(r.total)}</td>
                    <td className="px-4 py-3">
                      <select className="field py-1.5" value={r.status} onChange={(e) => setReservationStatus(r.code, e.target.value as ReservationStatus)} aria-label={`Status of ${r.code}`}>
                        <option value="confirmed">Confirmed</option>
                        <option value="picked-up">Picked up</option>
                        <option value="returned">Returned</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  )
}

export default function Staff() {
  useSeo(`Staff | ${business.name}`, 'Staff dashboard.', '/staff', { noindex: true })
  const { cars, reservations, resetDemo } = useStore()
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('motion.staff') === '1'
    } catch {
      return false
    }
  })
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [tab, setTab] = useState<'bookings' | 'inventory'>('bookings')
  const [resetArmed, setResetArmed] = useState(false)
  const today = isoDate(new Date())

  if (!unlocked) {
    return (
      <div className="container-page flex justify-center pt-16">
        <form
          className="grid w-full max-w-sm gap-4 rounded-3xl border border-border bg-card p-8"
          onSubmit={async (e) => {
            e.preventDefault()
            if (await pinMatches(pin)) {
              try {
                sessionStorage.setItem('motion.staff', '1')
              } catch {
                /* ignore */
              }
              setUnlocked(true)
            } else setPinError('That PIN is not right.')
          }}
        >
          <h1 className="text-2xl font-semibold tracking-tight">Staff login</h1>
          <label className="grid gap-1.5">
            <span className="field-label">PIN</span>
            <input type="password" inputMode="numeric" className="field" value={pin} onChange={(e) => setPin(e.target.value)} aria-invalid={!!pinError} />
            {SHOW_DEMO_PIN && <span className="text-xs text-muted-foreground">Demo PIN: 2468</span>}
            {pinError && <span className="field-error">{pinError}</span>}
          </label>
          <button className="btn-solid py-3">Open dashboard</button>
        </form>
      </div>
    )
  }

  const stats = [
    ['Ready to rent', cars.filter((c) => c.status === 'available').length],
    ['Out now', reservations.filter((r) => r.status === 'picked-up').length],
    ['Pickups today', reservations.filter((r) => r.status === 'confirmed' && r.pickup === today).length],
    ['In service', cars.filter((c) => c.status === 'maintenance').length],
  ] as const

  return (
    <div className="container-page pt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-semibold tracking-tighter">Dashboard</h1>
        <button className="-my-3 py-3 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground" onClick={() => { if (resetArmed) { resetDemo(); setResetArmed(false) } else setResetArmed(true) }} onBlur={() => setResetArmed(false)}>
          {resetArmed ? 'Click again to erase all bookings' : 'Reset demo data'}
        </button>
      </div>
      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-background p-5">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-3xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-10 flex gap-6 border-b border-border">
        {(['bookings', 'inventory'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('-mb-px border-b-2 pt-2 pb-3 text-sm font-medium capitalize transition-colors', tab === t ? 'border-signal text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>
      <div className="mt-8">{tab === 'bookings' ? <Bookings /> : <Inventory />}</div>
    </div>
  )
}
