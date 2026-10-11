import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme'

export function ThemeToggleButton() {
  const { theme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex-shrink-0 rounded-full bg-muted p-3.5 transition-colors hover:bg-border md:p-2.5"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
