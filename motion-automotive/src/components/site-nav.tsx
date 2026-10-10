import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { business } from '@/config/business'
import { cn } from '@/lib/utils'
import { BrandMark } from './brand-mark'
import { useTheme } from './theme'

const links = [
  { to: '/fleet', label: 'Fleet' },
  { to: '/#protection', label: 'Insurance' },
  { to: '/reservations', label: 'My booking' },
]

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex-shrink-0 rounded-full bg-muted p-2.5 transition-colors hover:bg-border"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

export function SiteNav({ brandName = business.name }: { brandName?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-30 text-foreground">
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex flex-shrink-0 items-center gap-2.5 text-lg font-semibold tracking-tight">
            <BrandMark />
            {brandName}
          </Link>
          <nav className="hidden lg:block" aria-label="Main">
            <ul className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      cn('rounded-full px-3 py-2 transition-colors hover:text-foreground', isActive && !l.to.includes('#') && 'text-foreground')
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <Link to="/fleet" className="btn-signal hidden lg:inline-flex">
            Find a car
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2.5 transition-colors hover:bg-muted lg:hidden"
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="container-page lg:hidden">
          <ul className="space-y-1 rounded-3xl border border-border bg-card p-2 shadow-lg shadow-black/5">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-muted">
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="p-2">
              <Link to="/fleet" onClick={() => setOpen(false)} className="btn-signal w-full">
                Find a car
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
