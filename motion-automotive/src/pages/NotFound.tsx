import { Link } from 'react-router-dom'
import { CalendarDays, CarFront, Phone, Ticket } from 'lucide-react'
import { Logo } from '@/components/logo'
import { business } from '@/config/business'
import { useSeo } from '@/lib/seo'

const routes = [
  { to: '/fleet', label: 'Browse the fleet', icon: CarFront },
  { to: '/weekly-car-rental', label: 'Weekly rentals', icon: CalendarDays },
  { to: '/reservations', label: 'Find my booking', icon: Ticket },
]

export default function NotFound() {
  useSeo(`Page not found | ${business.name}`, 'This page does not exist or has moved.', undefined, { noindex: true })
  return (
    <section className="container-page flex flex-col items-center py-20 text-center sm:py-28">
      <Logo className="h-auto w-[min(70vw,22rem)] opacity-90" />
      <p className="mt-10 font-mono text-sm tracking-[0.2em] text-muted-foreground uppercase">Error 404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tighter text-balance sm:text-5xl">This page took a wrong turn</h1>
      <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
        The page or car you were looking for is not here anymore. These will get you back on the road.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link to="/" className="btn-signal">Back to home</Link>
        {routes.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="btn-ghost">
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </div>
      <a href={`tel:${business.phone.replace(/[^\d+]/g, '')}`} className="mt-6 inline-flex items-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground">
        <Phone className="h-4 w-4" /> Or call us at {business.phone}
      </a>
    </section>
  )
}
