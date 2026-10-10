import { Suspense, useEffect } from 'react'
import { CookieConsent } from './cookie-consent'
import { captureSource, initAnalytics, trackPageView } from '@/lib/analytics'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './footer'
import { Header } from './ui/header-3'

function Analytics() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    initAnalytics()
    // Ad tags can sit before the # (hash routing) or in the router's own query string.
    captureSource(window.location.search)
  }, [])
  useEffect(() => {
    captureSource(search)
    // Let the page set its title first.
    const t = window.setTimeout(() => trackPageView(pathname + search), 0)
    return () => window.clearTimeout(t)
  }, [pathname, search])
  return null
}

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

/** On the home page the header floats over the landing, and the page brings its own cinematic footer. */
/** Shown for the moment a page's code is loading. Same size as a page top, so nothing jumps. */
function PageLoading() {
  return (
    <div className="container-page pt-8" aria-busy="true" aria-label="Loading">
      <div className="h-12 w-2/3 max-w-xl animate-pulse rounded-2xl bg-muted" />
      <div className="mt-4 h-5 w-1/2 max-w-md animate-pulse rounded-xl bg-muted" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-3xl bg-muted" />
        ))}
      </div>
    </div>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <ScrollManager />
      <Analytics />
      <Header overlay={pathname === '/'} />
      <main className="flex-1">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      {pathname !== '/' && <Footer />}
      <CookieConsent />
    </div>
  )
}
