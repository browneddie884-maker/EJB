/**
 * Lightweight spam guards for forms that have no server yet. They stop simple bots;
 * once bookings go to a backend, add a server-side check such as Cloudflare Turnstile.
 */

/** Name of a hidden field real visitors never see or fill in. */
export const HONEYPOT_NAME = 'company_website'

/** Bots submit in a blink; people take at least a few seconds to fill a booking form. */
export const MIN_FILL_MS = 3000

const LOG_KEY = 'motion.submissions'
const WINDOW_MS = 10 * 60 * 1000
const MAX_IN_WINDOW = 3

/** Returns a reason to block the submission, or null when it looks like a person. */
export function spamCheck(opts: { honeypot: string; startedAt: number }): string | null {
  if (opts.honeypot.trim()) return 'honeypot'
  if (Date.now() - opts.startedAt < MIN_FILL_MS) return 'too-fast'
  try {
    const now = Date.now()
    const recent = (JSON.parse(localStorage.getItem(LOG_KEY) || '[]') as number[]).filter((t) => now - t < WINDOW_MS)
    if (recent.length >= MAX_IN_WINDOW) return 'rate-limit'
    localStorage.setItem(LOG_KEY, JSON.stringify([...recent, now]))
  } catch {
    /* storage unavailable: skip the rate limit */
  }
  return null
}
