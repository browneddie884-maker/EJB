import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie } from 'lucide-react'
import { getConsent, setConsent, trackingConfigured, type Consent } from '@/lib/analytics'

const OPEN_EVENT = 'motion:cookie-settings'

/** Reopens the banner, e.g. from the footer or the privacy policy. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

/** The preview build shows the banner without real tracking so it can be reviewed. */
const showBanner = trackingConfigured || import.meta.env.VITE_DEMO === '1'

/**
 * Asks before any analytics or ad cookies load. Accept and Decline are equally easy,
 * and the choice can be changed later from "Cookie settings" in the footer.
 */
export function CookieConsent() {
  const [open, setOpen] = useState(() => showBanner && getConsent() === null)

  useEffect(() => {
    const reopen = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, reopen)
    return () => window.removeEventListener(OPEN_EVENT, reopen)
  }, [])

  if (!open) return null

  const choose = (c: Consent) => {
    setConsent(c)
    setOpen(false)
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:px-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-3xl border border-border bg-card p-5 text-foreground shadow-2xl shadow-black/20 sm:flex-row sm:items-center">
        <Cookie className="hidden h-6 w-6 shrink-0 text-signal-strong sm:block" strokeWidth={1.75} />
        <p className="text-sm leading-relaxed text-muted-foreground">
          We use cookies from Google and Meta to see which pages and ads bring bookings. They only load if you accept.{' '}
          <Link to="/privacy" className="font-medium text-foreground underline underline-offset-4">
            Privacy policy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="btn-ghost flex-1 sm:flex-none" onClick={() => choose('denied')}>
            Decline
          </button>
          <button type="button" className="btn-solid flex-1 sm:flex-none" onClick={() => choose('granted')}>
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
