import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Adapted from 21st.dev "Digital Serenity - Animated Landing Page" (minhxthanh).
 * Changes for Motion Automotive:
 * - Copy comes in through props (words animate in one by one, as in the original).
 * - Mouse glow and click ripples listen on this section only, not the whole document.
 * - Floating particles start after load instead of on a window scroll listener.
 * - Word animation is driven by refs, so it cannot pick up other elements on the page.
 * - Visitors who prefer reduced motion get the finished text with no animation.
 * - A `children` slot under the headline holds the booking search.
 */
interface DigitalSerenityProps {
  topLine?: string
  headline?: string
  subline?: string
  bottomLine?: string
  children?: ReactNode
}

type Ripple = { id: number; x: number; y: number }

const pageStyles = `
  .ds-root .ds-mouse { position: absolute; pointer-events: none; border-radius: 9999px;
    background-image: radial-gradient(circle, rgba(255, 106, 51, 0.10), rgba(156, 163, 175, 0.05), transparent 70%);
    transform: translate(-50%, -50%); will-change: left, top, opacity;
    transition: left 70ms linear, top 70ms linear, opacity 300ms ease-out; }
  @keyframes word-appear { 0% { opacity: 0; transform: translateY(30px) scale(0.8); filter: blur(10px); } 50% { opacity: 0.8; transform: translateY(10px) scale(0.95); filter: blur(2px); } 100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
  @keyframes grid-draw { 0% { stroke-dashoffset: 1000; opacity: 0; } 50% { opacity: 0.3; } 100% { stroke-dashoffset: 0; opacity: 0.15; } }
  @keyframes pulse-glow { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.1); } }
  .ds-root .word-animate { display: inline-block; opacity: 0; margin: 0 0.1em; transition: color 0.3s ease, transform 0.3s ease, text-shadow 0.3s ease; }
  .ds-root .word-animate:hover { color: #cbd5e1; transform: translateY(-2px); text-shadow: 0 0 20px rgba(203, 213, 225, 0.5); }
  .ds-root .grid-line { stroke: #94a3b8; stroke-width: 0.5; opacity: 0; stroke-dasharray: 5 5; stroke-dashoffset: 1000; animation: grid-draw 2s ease-out forwards; }
  .ds-root .detail-dot { fill: #cbd5e1; opacity: 0; animation: pulse-glow 3s ease-in-out infinite; }
  .ds-root .corner-element-animate { position: absolute; width: 40px; height: 40px; border: 1px solid rgba(203, 213, 225, 0.2); opacity: 0; animation: word-appear 1s ease-out forwards; }
  .ds-root .text-decoration-animate { position: relative; }
  .ds-root .text-decoration-animate::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 1px; background: linear-gradient(90deg, transparent, #ff6a33, transparent); animation: underline-grow 2s ease-out forwards; animation-delay: 2s; }
  @keyframes underline-grow { to { width: 100%; } }
  .ds-root .floating-element-animate { position: absolute; width: 2px; height: 2px; background: #cbd5e1; border-radius: 50%; opacity: 0; animation: float 4s ease-in-out infinite; animation-play-state: paused; }
  .ds-root .floating-element-animate.is-running { animation-play-state: running; }
  @keyframes float { 0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; } 25% { transform: translateY(-10px) translateX(5px); opacity: 0.6; } 50% { transform: translateY(-5px) translateX(-3px); opacity: 0.4; } 75% { transform: translateY(-15px) translateX(7px); opacity: 0.8; } }
  .ds-root .ripple-effect { position: absolute; width: 4px; height: 4px; background: rgba(203, 213, 225, 0.6); border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; animation: pulse-glow 1s ease-out forwards; z-index: 50; }
  .ds-root .fade-in { opacity: 0; animation: word-appear 1s ease-out forwards; }
  @media (prefers-reduced-motion: reduce) {
    .ds-root .word-animate, .ds-root .corner-element-animate, .ds-root .fade-in { opacity: 1 !important; animation: none !important; }
    .ds-root .grid-line { animation: none; opacity: 0.15; stroke-dashoffset: 0; }
    .ds-root .detail-dot, .ds-root .floating-element-animate { animation: none; opacity: 0.3; }
    .ds-root .text-decoration-animate::after { animation: none; width: 100%; }
    .ds-root .ds-mouse, .ds-root .ripple-effect { display: none; }
  }
`

/** Splits a line into words, each with its own entrance delay. */
function Words({ text, start, step }: { text: string; start: number; step: number }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={`${word}-${i}`} className="word-animate" data-delay={start + i * step}>
          {word}
        </span>
      ))}
    </>
  )
}

const DigitalSerenity = ({
  topLine = 'Stillness speaks.',
  headline = 'Find your center,',
  subline = 'where peace resides and clarity awakens within the soul.',
  bottomLine = 'Observe, accept, let go.',
  children,
}: DigitalSerenityProps) => {
  const rootRef = useRef<HTMLElement>(null)
  const [mouse, setMouse] = useState({ left: '0px', top: '0px', opacity: 0 })
  const [ripples, setRipples] = useState<Ripple[]>([])

  const headlineStart = 700
  const sublineStart = headlineStart + headline.split(' ').length * 150 + 250
  const bottomStart = sublineStart + subline.split(' ').length * 90 + 200

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const timers: number[] = []
    timers.push(
      window.setTimeout(() => {
        root.querySelectorAll<HTMLElement>('.word-animate').forEach((word) => {
          const delay = Number(word.dataset.delay) || 0
          timers.push(window.setTimeout(() => (word.style.animation = 'word-appear 0.8s ease-out forwards'), delay))
        })
      }, 500),
    )
    root.querySelectorAll<HTMLElement>('.floating-element-animate').forEach((el, index) => {
      timers.push(window.setTimeout(() => el.classList.add('is-running'), 1200 + index * 250))
    })
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [headline, subline, topLine, bottomLine])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const local = (e: MouseEvent) => {
      const r = root.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onMove = (e: MouseEvent) => {
      const { x, y } = local(e)
      setMouse({ left: `${x}px`, top: `${y}px`, opacity: 1 })
    }
    const onLeave = () => setMouse((prev) => ({ ...prev, opacity: 0 }))
    const onClick = (e: MouseEvent) => {
      const { x, y } = local(e)
      const ripple = { id: Date.now(), x, y }
      setRipples((prev) => [...prev, ripple])
      window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id)), 1000)
    }
    root.addEventListener('mousemove', onMove)
    root.addEventListener('mouseleave', onLeave)
    root.addEventListener('click', onClick)
    return () => {
      root.removeEventListener('mousemove', onMove)
      root.removeEventListener('mouseleave', onLeave)
      root.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <section ref={rootRef} className="ds-root relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-900 via-[#0b0c0e] to-slate-800 text-slate-100">
      <style>{pageStyles}</style>

      <svg className="pointer-events-none absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <pattern id="gridReactDarkResponsive" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(100, 116, 139, 0.1)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridReactDarkResponsive)" />
        <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: '0.5s' }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: '1s' }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: '1.5s' }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: '2s' }} />
        <line x1="50%" y1="0" x2="50%" y2="100%" className="grid-line" style={{ animationDelay: '2.5s', opacity: 0.05 }} />
        <line x1="0" y1="50%" x2="100%" y2="50%" className="grid-line" style={{ animationDelay: '3s', opacity: 0.05 }} />
        <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3s' }} />
        <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3.2s' }} />
        <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.4s' }} />
        <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.6s' }} />
        <circle cx="50%" cy="50%" r="1.5" className="detail-dot" style={{ animationDelay: '4s' }} />
      </svg>

      <div className="corner-element-animate bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8" style={{ animationDelay: '4.4s' }}>
        <div className="absolute bottom-0 left-0 h-2 w-2 rounded-full bg-slate-300 opacity-30" />
      </div>
      <div className="corner-element-animate right-4 bottom-4 sm:right-6 sm:bottom-6 md:right-8 md:bottom-8" style={{ animationDelay: '4.6s' }}>
        <div className="absolute right-0 bottom-0 h-2 w-2 rounded-full bg-slate-300 opacity-30" />
      </div>

      <div className="floating-element-animate" style={{ top: '25%', left: '15%', animationDelay: '0.5s' }} />
      <div className="floating-element-animate" style={{ top: '60%', left: '85%', animationDelay: '1s' }} />
      <div className="floating-element-animate" style={{ top: '40%', left: '10%', animationDelay: '1.5s' }} />
      <div className="floating-element-animate" style={{ top: '75%', left: '90%', animationDelay: '2s' }} />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-between gap-10 px-6 pt-28 pb-10 sm:px-8 md:px-16 md:pb-16">
        <div className="text-center">
          <p className="font-mono text-xs font-light tracking-[0.2em] text-slate-300 uppercase opacity-80 sm:text-sm">
            <Words text={topLine} start={0} step={300} />
          </p>
          <div className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30 sm:w-16" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <h1 className="text-decoration-animate text-4xl leading-tight font-extralight tracking-tight text-slate-50 sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="mb-4 block md:mb-6">
              <Words text={headline} start={headlineStart} step={150} />
            </span>
            <span className="mx-auto block max-w-4xl text-xl leading-relaxed font-thin tracking-wide text-balance text-slate-300 sm:text-2xl md:text-3xl">
              <Words text={subline} start={sublineStart} step={90} />
            </span>
          </h1>
          <div className="fade-in absolute top-1/2 -left-6 h-px w-3 -translate-y-1/2 bg-slate-300 sm:-left-8 sm:w-4" style={{ animationDelay: '3.2s' }} />
          <div className="fade-in absolute top-1/2 -right-6 h-px w-3 -translate-y-1/2 bg-slate-300 sm:-right-8 sm:w-4" style={{ animationDelay: '3.4s' }} />
        </div>

        <div className="w-full text-center">
          <div className="mx-auto mb-4 h-px w-12 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30 sm:w-16" />
          <p className="font-mono text-xs font-light tracking-[0.2em] text-slate-300 uppercase opacity-80 sm:text-sm">
            <Words text={bottomLine} start={bottomStart} step={180} />
          </p>
          {children && (
            <div className="fade-in mx-auto mt-8 w-full max-w-5xl text-left" style={{ animationDelay: '1.6s' }}>
              {children}
            </div>
          )}
        </div>
      </div>

      <div
        className="ds-mouse h-60 w-60 blur-xl sm:h-80 sm:w-80 sm:blur-2xl md:h-96 md:w-96 md:blur-3xl"
        style={{ left: mouse.left, top: mouse.top, opacity: mouse.opacity }}
      />
      {ripples.map((ripple) => (
        <div key={ripple.id} className="ripple-effect" style={{ left: ripple.x, top: ripple.y }} />
      ))}
    </section>
  )
}

export default DigitalSerenity
