import { Link } from 'react-router-dom'
import { business } from '@/config/business'
import { landingPages } from '@/config/landing-pages'
import { BrandMark } from './brand-mark'
import { SocialLinks } from './social-links'

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2.5 font-semibold"><BrandMark />{business.name}</Link>
          <p className="max-w-[40ch] text-sm leading-relaxed text-muted-foreground">
            Local car rental with clear prices. Bring your own insurance or pick one of ours at checkout.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Contact</p>
          <a className="block text-muted-foreground hover:text-foreground" href={`tel:${business.phone.replace(/[^\d+]/g, '')}`}>{business.phone}</a>
          <a className="block text-muted-foreground hover:text-foreground" href={`mailto:${business.email}`}>{business.email}</a>
          <p className="text-muted-foreground">{business.hours}</p>
          <SocialLinks className="pt-2" />
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Rent</p>
          <Link className="block text-muted-foreground hover:text-foreground" to="/fleet">Fleet</Link>
          <Link className="block text-muted-foreground hover:text-foreground" to="/reservations">My booking</Link>
          <Link className="block text-muted-foreground hover:text-foreground" to="/staff">Staff login</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Rentals</p>
          {landingPages.map((p) => (
            <Link key={p.slug} className="block text-muted-foreground hover:text-foreground" to={`/${p.slug}`}>{p.linkLabel}</Link>
          ))}
        </div>
      </div>
      <div className="container-page pb-8 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {business.name}
      </div>
    </footer>
  )
}
