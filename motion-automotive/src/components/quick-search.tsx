import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { business } from '@/config/business'
import { addDays, cn, isoDate } from '@/lib/utils'

export function QuickSearch({ className }: { className?: string }) {
  const navigate = useNavigate()
  const today = isoDate(new Date())
  const [loc, setLoc] = useState(business.locations[0].id)
  const [from, setFrom] = useState(addDays(today, 1))
  const [to, setTo] = useState(addDays(today, 4))
  const invalid = to <= from

  function submit(e: FormEvent) {
    e.preventDefault()
    if (invalid) return
    navigate(`/fleet?from=${from}&to=${to}&loc=${loc}`)
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        'grid grid-cols-1 gap-3 rounded-3xl border border-border bg-card p-3 shadow-xl shadow-black/10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-end',
        className,
      )}
    >
      <label className="grid gap-1.5 px-1">
        <span className="field-label">Pickup</span>
        <select className="field" value={loc} onChange={(e) => setLoc(e.target.value)}>
          {business.locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 px-1">
        <span className="field-label">From</span>
        <input type="date" className="field" min={today} value={from} onChange={(e) => {
          setFrom(e.target.value)
          if (to <= e.target.value) setTo(addDays(e.target.value, 1))
        }} required />
      </label>
      <label className="grid gap-1.5 px-1">
        <span className="field-label">Until</span>
        <input type="date" className="field" min={addDays(from, 1)} value={to} onChange={(e) => setTo(e.target.value)} required aria-invalid={invalid} />
      </label>
      <button type="submit" className="btn-signal h-[42px] px-6 sm:col-span-2 lg:col-span-1" disabled={invalid}>
        Find a car <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  )
}
