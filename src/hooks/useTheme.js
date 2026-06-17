import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'coffee-tracker-theme'
const DEFAULT = 'light'

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT
    } catch {
      return DEFAULT
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  return [theme, setTheme]
}
