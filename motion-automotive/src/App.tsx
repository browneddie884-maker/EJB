import { lazy } from 'react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { ThemeProvider } from '@/components/theme'
import { StoreProvider } from '@/store/store'
import { landingPages } from '@/config/landing-pages'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'

// Every page but the home page loads on demand, so the first visit downloads less.
const Fleet = lazy(() => import('@/pages/Fleet'))
const CarDetail = lazy(() => import('@/pages/CarDetail'))
const Book = lazy(() => import('@/pages/Book'))
const Staff = lazy(() => import('@/pages/Staff'))
const Landing = lazy(() => import('@/pages/Landing'))
const ReservationLookup = lazy(() => import('@/pages/Reservations').then((m) => ({ default: m.ReservationLookup })))
const ReservationDetail = lazy(() => import('@/pages/Reservations').then((m) => ({ default: m.ReservationDetail })))
const PrivacyPolicy = lazy(() => import('@/pages/Legal').then((m) => ({ default: m.PrivacyPolicy })))
const Terms = lazy(() => import('@/pages/Legal').then((m) => ({ default: m.Terms })))

// Hash routing for static hosts that cannot rewrite every path to index.html.
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <Router>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="fleet" element={<Fleet />} />
                <Route path="fleet/:id" element={<CarDetail />} />
                <Route path="book/:id" element={<Book />} />
                <Route path="reservations" element={<ReservationLookup />} />
                <Route path="reservations/:code" element={<ReservationDetail />} />
                <Route path="staff" element={<Staff />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="terms" element={<Terms />} />
                {landingPages.map((p) => (
                  <Route key={p.slug} path={p.slug} element={<Landing page={p} />} />
                ))}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
        </Router>
      </StoreProvider>
    </ThemeProvider>
  )
}
