import logo from '@/assets/logo.png'
import { business } from '@/config/business'
import { cn } from '@/lib/utils'

/** The Motion Automotive chrome wordmark (transparent PNG, reads on light and dark). */
export function Logo({ className, eager }: { className?: string; eager?: boolean }) {
  return (
    <img
      src={logo}
      alt={business.name}
      width={1000}
      height={239}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cn('h-9 w-auto select-none', className)}
      draggable={false}
    />
  )
}
