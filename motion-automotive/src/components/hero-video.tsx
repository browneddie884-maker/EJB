import { useEffect, useRef, useState } from 'react'
import heroMp4 from '@/assets/hero/motion-hero.mp4'
import heroWebm from '@/assets/hero/motion-hero.webm'
import heroPoster from '@/assets/hero/motion-hero-poster.webp'

/** True when the visitor asked for less motion or to save mobile data. */
function prefersStill() {
  if (typeof window === 'undefined') return true
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches || Boolean(saveData)
}

/**
 * Full-bleed background film for the home landing: a deal in the business district, the keys
 * handed over, the car up close and on the road, the private jet, then landing to a car already
 * waiting at arrival.
 * Muted and looping; it pauses when scrolled out of view, and visitors who
 * prefer reduced motion or save data see the still poster instead.
 * Footage: Mixkit and Coverr (free licenses, no attribution required). Swap in the client's own film
 * by replacing the files in src/assets/hero/ (WebM for Chrome and Firefox, MP4 for Safari).
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [still] = useState(prefersStill)

  useEffect(() => {
    const video = ref.current
    if (!video || still) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {})
      else video.pause()
    })
    io.observe(video)
    return () => io.disconnect()
  }, [still])

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {still ? (
        <img src={heroPoster} alt="" className="h-full w-full object-cover" />
      ) : (
        <video ref={ref} className="h-full w-full object-cover" poster={heroPoster} autoPlay muted loop playsInline preload="auto">
          <source src={heroWebm} type="video/webm" />
          <source src={heroMp4} type="video/mp4" />
        </video>
      )}
      {/* Darkens the footage so the logo, headline and search stay readable. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,12,14,0.45),rgba(11,12,14,0.8))]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgba(11,12,14,0.7)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[rgba(11,12,14,0.85)] to-transparent" />
    </div>
  )
}
