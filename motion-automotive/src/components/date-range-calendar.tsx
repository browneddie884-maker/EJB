import { useEffect, useState } from 'react'
import type { DateRange, Matcher } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'
import { addDays, cn, daysBetween, isoDate, prettyDate } from '@/lib/utils'

const toDate = (iso: string) => new Date(iso + 'T12:00:00')

export type BookedRange = { pickup: string; dropoff: string }

/**
 * Pickup/return picker built on the shadcn range calendar (Calendar06 pattern).
 * Past days and nights already booked for this car are disabled, and a range
 * cannot be dragged across them.
 */
export function DateRangeCalendar({
  from,
  to,
  onChange,
  booked = [],
  months = 1,
  className,
}: {
  from: string
  to: string
  onChange: (from: string, to: string) => void
  booked?: BookedRange[]
  months?: 1 | 2
  className?: string
}) {
  const [range, setRange] = useState<DateRange | undefined>({ from: toDate(from), to: toDate(to) })
  const [wide, setWide] = useState(() => window.matchMedia?.('(min-width: 768px)').matches ?? true)

  useEffect(() => {
    setRange({ from: toDate(from), to: toDate(to) })
  }, [from, to])

  useEffect(() => {
    const q = window.matchMedia?.('(min-width: 768px)')
    if (!q) return
    const read = () => setWide(q.matches)
    q.addEventListener('change', read)
    return () => q.removeEventListener('change', read)
  }, [])

  const today = isoDate(new Date())
  // A booking holds the car for the nights from pickup up to (not including) the return day.
  const bookedNights: Matcher[] = booked.map((b) => ({ from: toDate(b.pickup), to: toDate(addDays(b.dropoff, -1)) }))
  const disabled: Matcher[] = [{ before: toDate(today) }, ...bookedNights]

  const complete = range?.from && range?.to && isoDate(range.to) > isoDate(range.from)

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <Calendar
        mode="range"
        defaultMonth={range?.from}
        selected={range}
        onSelect={(next, clicked) => {
          // With a full range already chosen, a click starts a new trip on that day
          // instead of stretching the old one.
          if (complete && clicked) {
            setRange({ from: clicked, to: undefined })
            return
          }
          setRange(next)
          if (next?.from && next?.to && isoDate(next.to) > isoDate(next.from)) onChange(isoDate(next.from), isoDate(next.to))
        }}
        numberOfMonths={wide ? months : 1}
        min={1}
        excludeDisabled
        disabled={disabled}
        showOutsideDays={false}
        // Unavailable days stay readable: dimmed, and booked ones are struck through.
        classNames={{ disabled: 'text-muted-foreground opacity-75' }}
        modifiers={{ booked: bookedNights }}
        modifiersClassNames={{ booked: 'line-through decoration-danger decoration-2' }}
        className="mx-auto rounded-2xl border border-border bg-card p-3 shadow-sm [--cell-size:--spacing(9)] sm:[--cell-size:--spacing(10)]"
      />
      <p className="text-center text-sm text-muted-foreground" aria-live="polite">
        {complete
          ? `${prettyDate(isoDate(range!.from!))} to ${prettyDate(isoDate(range!.to!))}, ${daysBetween(isoDate(range!.from!), isoDate(range!.to!))} ${daysBetween(isoDate(range!.from!), isoDate(range!.to!)) === 1 ? 'day' : 'days'}`
          : 'Now pick your return day. Minimum rental is 1 day.'}
      </p>
    </div>
  )
}
