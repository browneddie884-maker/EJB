import { useRef, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Pause, Play } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'

/**
 * Adapted from 21st.dev "Hero With Video" (jahed/hero-with-video).
 * Changes: left-aligned split headline, shared site nav, video autoplays muted unless the
 * visitor prefers reduced motion, and the email form slot became a `children` slot (booking search).
 */
interface NavbarHeroProps {
  brandName?: string
  heroTitle?: string
  heroSubtitle?: string
  heroDescription?: string
  backgroundImage?: string
  videoUrl?: string
  children?: ReactNode
}

const ease = [0.16, 1, 0.3, 1] as const

const NavbarHero = ({
  brandName,
  heroTitle = 'Innovation Meets Simplicity',
  heroSubtitle,
  heroDescription = 'Discover cutting-edge solutions designed for the modern digital landscape.',
  backgroundImage = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=75',
  videoUrl,
  children,
}: NavbarHeroProps) => {
  const reduce = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoPaused, setIsVideoPaused] = useState(!!reduce)

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play()
      setIsVideoPaused(false)
    } else {
      v.pause()
      setIsVideoPaused(true)
    }
  }

  const rise = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease } }

  return (
    <section className="relative">
      <SiteNav brandName={brandName} />

      <div className="container-page pt-6 pb-8 sm:pt-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <motion.h1 {...rise(0)} className="text-4xl font-semibold leading-[1.02] tracking-tighter sm:text-5xl lg:col-span-7 lg:text-6xl">
            {heroTitle}
          </motion.h1>
          <motion.div {...rise(0.1)} className="lg:col-span-5 lg:pb-2">
            {heroSubtitle && <p className="mb-2 text-sm font-medium text-signal-strong">{heroSubtitle}</p>}
            <p className="max-w-[46ch] text-base leading-relaxed text-muted-foreground sm:text-lg">{heroDescription}</p>
          </motion.div>
        </div>
      </div>

      <div className="container-page">
        <motion.header
          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="relative h-[44vh] min-h-[300px] w-full overflow-hidden rounded-3xl bg-muted lg:h-[52vh]"
        >
          <img
            src={backgroundImage}
            alt="Rental cars lined up in the Motion Automotive garage"
            fetchPriority="high"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${isVideoPlaying ? 'opacity-0' : 'opacity-100'}`}
          />
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={backgroundImage}
              autoPlay={!reduce}
              loop
              muted
              playsInline
              preload={reduce ? 'none' : 'auto'}
              onPlaying={() => setIsVideoPlaying(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${isVideoPlaying ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          {videoUrl && (
            <button
              onClick={toggle}
              aria-label={isVideoPaused ? 'Play video' : 'Pause video'}
              className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/30 backdrop-blur-md transition hover:bg-black/45 active:scale-95"
            >
              {isVideoPaused ? <Play className="ml-0.5 h-5 w-5 fill-white text-white" /> : <Pause className="h-5 w-5 fill-white text-white" />}
            </button>
          )}
        </motion.header>

        {children && (
          <motion.div {...rise(0.35)} className="relative z-10 mx-auto -mt-16 max-w-5xl px-2 sm:-mt-14 sm:px-6">
            {children}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export { NavbarHero }
