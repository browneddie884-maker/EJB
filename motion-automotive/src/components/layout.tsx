import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './footer'
import { SiteNav } from './site-nav'

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

/** The home page renders its own nav over the landing and its own cinematic footer. */
export function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <ScrollManager />
      {pathname !== '/' && <SiteNav />}
      <main className="flex-1">
        <Outlet />
      </main>
      {pathname !== '/' && <Footer />}
    </div>
  )
}
