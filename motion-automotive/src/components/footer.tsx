import { Link } from 'react-router-dom'
import { business } from '@/config/business'
import { landingPages } from '@/config/landing-pages'
import { LegalLinks } from './legal-links'
import { Logo } from './logo'
import { SocialLinks } from './social-links'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Link to="/" className="inline-block" aria-label={`${business.name} home`}><Logo className="h-12" /></Link>
          <p className="max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
            Local car rental with clear prices. Bring your own insurance or pick one of ours at checkout.
          </p>
        </div>
        <div className="text-sm md:space-y-2">
          <p className="pb-1 font-medium md:pb-0">Contact</p>
          <a className="block py-3 text-muted-foreground hover:text-foreground md:py-0" href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}>{business.phone}</a>
          <a className="block py-3 text-muted-foreground hover:text-foreground md:py-0" href={`mailto:${business.email}`}>{business.email}</a>
          <p className="py-3 text-muted-foreground md:py-0">{business.hours}</p>
          <SocialLinks className="pt-2" />
        </div>
        <div className="text-sm md:space-y-2">
          <p className="pb-1 font-medium md:pb-0">Rent</p>
          <Link className="block py-3 text-muted-foreground hover:text-foreground md:py-0" to="/fleet">Fleet</Link>
          <Link className="block py-3 text-muted-foreground hover:text-foreground md:py-0" to="/reservations">My booking</Link>
          <Link className="block py-3 text-muted-foreground hover:text-foreground md:py-0" to="/staff">Staff login</Link>
        </div>
        <div className="text-sm md:space-y-2">
          <p className="pb-1 font-medium md:pb-0">Rentals</p>
          {landingPages.map((p) => (
            <Link key={p.slug} className="block py-3 text-muted-foreground hover:text-foreground md:py-0" to={`/${p.slug}`}>{p.linkLabel}</Link>
          ))}
        </div>
      </div>
      <div className="container-page flex flex-col gap-3 pb-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>&copy; {new Date().getFullYear()} {business.name}</span>
        <LegalLinks />
      </div>
    </footer>
  )
}
