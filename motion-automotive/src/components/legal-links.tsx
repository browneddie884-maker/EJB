import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { openCookieSettings } from './cookie-consent'

/** Privacy, terms and cookie settings, shown in both footers. */
export function LegalLinks({ className }: { className?: string }) {
  const item = 'underline-offset-4 hover:text-foreground hover:underline'
  return (
    <nav aria-label="Legal" className={cn('flex flex-wrap items-center gap-x-4 gap-y-1', className)}>
      <Link to="/privacy" className={item}>Privacy policy</Link>
      <Link to="/terms" className={item}>Rental terms</Link>
      <button type="button" onClick={openCookieSettings} className={item}>Cookie settings</button>
    </nav>
  )
}
