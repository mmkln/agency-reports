/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const THEME_STORAGE_KEY = 'agency-reports-theme'
const THEME_QUERY = '(prefers-color-scheme: dark)'

const ThemeContext = createContext(null)

function isThemeMode(value) {
  return value === 'light' || value === 'dark' || value === 'system'
}

function getSystemTheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  return window.matchMedia(THEME_QUERY).matches ? 'dark' : 'light'
}

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'system'
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(storedTheme) ? storedTheme : 'system'
  } catch {
    return 'system'
  }
}

function applyResolvedTheme(resolvedTheme) {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  const themeColor = document.querySelector('meta[name="theme-color"]')

  root.classList.toggle('dark', resolvedTheme === 'dark')
  root.style.colorScheme = resolvedTheme
  themeColor?.setAttribute('content', resolvedTheme === 'dark' ? '#1D1D1F' : '#F5F5F7')
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)
  const [systemTheme, setSystemTheme] = useState(getSystemTheme)
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia(THEME_QUERY)
    const handleChange = (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    applyResolvedTheme(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = useCallback((nextTheme) => {
    setThemeState(nextTheme)

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    } catch {
      return
    }
  }, [])

  const value = useMemo(
    () => ({
      resolvedTheme,
      setTheme,
      theme,
    }),
    [resolvedTheme, setTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
