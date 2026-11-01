import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void } | null>(null)

function initialTheme(): Theme {
  // An embedding host (e.g. the artifact viewer) may set data-theme on <html>.
  const hostTheme = document.documentElement.dataset.theme
  if (hostTheme === 'light' || hostTheme === 'dark') return hostTheme
  try {
    const saved = localStorage.getItem('motion.theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* ignore */
  }
  // Dark by default: the landing, wheel and footer were chosen as dark designs.
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Follow an embedding host (e.g. the artifact viewer) when it switches theme.
  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      const host = root.dataset.theme
      if (host === 'light' || host === 'dark') setThemeState(host)
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    try {
      localStorage.setItem('motion.theme', t)
    } catch {
      /* ignore */
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
