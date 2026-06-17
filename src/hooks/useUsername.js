import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'coffee-tracker-username'
const DEFAULT = 'Guest'

export function useUsername() {
  const [username, setUsernameState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT
    } catch {
      return DEFAULT
    }
  })

  const setUsername = useCallback((name) => {
    const trimmed = name.trim() || DEFAULT
    setUsernameState(trimmed)
    try {
      localStorage.setItem(STORAGE_KEY, trimmed)
    } catch {
      /* ignore */
    }
  }, [])

  return [username, setUsername]
}

export function getStoredUsername() {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT
  } catch {
    return DEFAULT
  }
}
