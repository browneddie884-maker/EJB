import { useEffect } from 'react'
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
export function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <ScrollManager />
      <Analytics />
      <Header overlay={pathname === '/'} />
      <main className="flex-1">
        <Outlet />
      </main>
      {pathname !== '/' && <Footer />}
    </div>
  )
}
