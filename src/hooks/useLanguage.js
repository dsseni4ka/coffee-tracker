import { useCallback, useState } from 'react'

const STORAGE_KEY = 'coffee-tracker-language'
const DEFAULT = 'en'

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'nl', label: 'Nederlands' },
  { id: 'de', label: 'Deutsch' },
  { id: 'fr', label: 'Français' },
]

export function useLanguage() {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT
    } catch {
      return DEFAULT
    }
  })

  const setLanguage = useCallback((next) => {
    setLanguageState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  return [language, setLanguage]
}
