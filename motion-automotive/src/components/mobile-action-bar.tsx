import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Bottom bar for phones that keeps the price and the next step in reach on long pages.
 * It hides itself while the element with `watchId` (the full booking box) is on screen,
 * so the two never show at once. Hidden from large screens, where that box sits beside the content.
 */
export function MobileActionBar({ watchId, children }: { watchId: string; children: ReactNode }) {
  const [targetVisible, setTargetVisible] = useState(false)

  useEffect(() => {
    const el = document.getElementById(watchId)
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setTargetVisible(entry.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [watchId])

  return (
    <>
      {/* Keeps the footer clear of the bar. */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur-lg transition-transform duration-300 lg:hidden',
          targetVisible && 'pointer-events-none translate-y-full',
        )}
        aria-hidden={targetVisible}
      >
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">{children}</div>
      </div>
    </>
  )
}
