import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { ThemeProvider } from '@/components/theme'
import { StoreProvider } from '@/store/store'
import Book from '@/pages/Book'
import CarDetail from '@/pages/CarDetail'
import Fleet from '@/pages/Fleet'
import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import { ReservationDetail, ReservationLookup } from '@/pages/Reservations'
import Staff from '@/pages/Staff'

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
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </StoreProvider>
    </ThemeProvider>
  )
}
