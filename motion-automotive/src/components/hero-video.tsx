import { useEffect, useRef, useState } from 'react'
import heroMp4 from '@/assets/hero/motion-hero.mp4'
import heroWebm from '@/assets/hero/motion-hero.webm'
import heroPoster from '@/assets/hero/motion-hero-poster.webp'

/** True when the visitor asked for less motion. */
function prefersStill() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * The shareable one-file preview embeds the film as a data: URL, which Safari on iPhone will not
 * stream, so it is also offered as a blob: URL. Decoded by hand rather than with fetch() so a
 * strict host page cannot block it. Normal hosting serves real files and skips this.
 */
function toBlobUrl(dataUrl: string) {
  try {
    const [head, b64] = dataUrl.split(',', 2)
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
    return URL.createObjectURL(new Blob([bytes], { type: head.slice(5).split(';')[0] }))
  } catch {
    return ''
  }
}

/**
 * Sources to try in order. MP4 (H.264) plays everywhere, iPhones included; WebM covers browsers
 * built without H.264. Embedded files get a blob: copy first and the raw data: URL as a fallback.
 */
function candidates(video: HTMLVideoElement) {
  const files = video.canPlayType('video/mp4; codecs="avc1.640028"') ? [heroMp4, heroWebm] : [heroWebm, heroMp4]
  return files.flatMap((src) => (src.startsWith('data:') ? [toBlobUrl(src), src] : [src])).filter(Boolean)
}

/**
 * Full-bleed background film for the home landing: a deal in the business district, the keys
 * handed over, the car up close and on the road, the private jet, then landing to a car already
 * waiting at arrival.
 * Muted and looping; it pauses when scrolled out of view, and visitors who prefer reduced motion
 * see the still poster instead. If the phone blocks autoplay (Low Power Mode, data saver), the
 * film starts on the first tap or scroll.
 * Footage: Mixkit and Coverr (free licenses, no attribution required). Swap in the client's own film
 * by replacing the files in src/assets/hero/ (MP4 for most browsers, WebM as a fallback).
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [still] = useState(prefersStill)

  useEffect(() => {
    const video = ref.current
    if (!video || still) return
    let inView = true

    // iPhones only autoplay video that is muted and inline as markup attributes, and React sets
    // `muted` as a property only, so set both here.
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')

    const tryPlay = () => {
      if (inView && video.paused && video.currentSrc) void video.play().catch(() => {})
    }

    // Load the first source; if the browser or host page refuses it, move on to the next.
    const sources = candidates(video)
    let index = 0
    const load = () => {
      video.src = sources[index]
      video.load()
    }
    const onError = () => {
      if (index < sources.length - 1) {
        index += 1
        load()
      }
    }
    video.addEventListener('error', onError)
    load()

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) tryPlay()
      else video.pause()
    })
    io.observe(video)

    // Fallback when autoplay is blocked: start on the first interaction.
    const kick = () => tryPlay()
    const events = ['touchstart', 'pointerdown', 'scroll', 'keydown'] as const
    events.forEach((e) => window.addEventListener(e, kick, { passive: true }))
    video.addEventListener('canplay', kick)

    return () => {
      io.disconnect()
      events.forEach((e) => window.removeEventListener(e, kick))
      video.removeEventListener('canplay', kick)
      video.removeEventListener('error', onError)
      sources.filter((u) => u.startsWith('blob:')).forEach((u) => URL.revokeObjectURL(u))
    }
  }, [still])

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {still ? (
        <img src={heroPoster} alt="" className="h-full w-full object-cover" />
      ) : (
        <video ref={ref} className="h-full w-full object-cover" poster={heroPoster} autoPlay muted loop playsInline preload="auto" />
      )}
      {/* Darkens the footage so the logo, headline and search stay readable. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,12,14,0.45),rgba(11,12,14,0.8))]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgba(11,12,14,0.7)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[rgba(11,12,14,0.85)] to-transparent" />
    </div>
  )
}
