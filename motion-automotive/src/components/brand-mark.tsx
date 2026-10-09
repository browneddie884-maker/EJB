import { cn } from '@/lib/utils'

/** Simple geometric mark: two forward-leaning bars, the "motion" slash. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-xl bg-foreground', className)} aria-hidden>
      <svg viewBox="0 0 24 24" className="h-4 w-4">
        <path d="M5 19 L11 5 H14 L8 19 Z" className="fill-background" />
        <path d="M11 19 L17 5 H20 L14 19 Z" className="fill-signal" />
      </svg>
    </span>
  )
}
