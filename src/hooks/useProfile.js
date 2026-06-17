import { useCallback, useEffect, useState } from 'react'
import { useUsername } from './useUsername'

const BIO_KEY = 'coffee-tracker-bio'
const PHOTO_KEY = 'coffee-tracker-profile-photo'

function readStorage(key, fallback = '') {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}

export function useProfile() {
  const [username, setUsername] = useUsername()
  const [bio, setBioState] = useState(() => readStorage(BIO_KEY))
  const [photo, setPhotoState] = useState(() => readStorage(PHOTO_KEY))

  useEffect(() => {
    function syncPhotoFromStorage(event) {
      if (event && event.key !== PHOTO_KEY) return
      setPhotoState(readStorage(PHOTO_KEY))
    }

    window.addEventListener('storage', syncPhotoFromStorage)
    return () => window.removeEventListener('storage', syncPhotoFromStorage)
  }, [])

  const setBio = useCallback((value) => {
    const trimmed = value.trim()
    setBioState(trimmed)
    try {
      localStorage.setItem(BIO_KEY, trimmed)
    } catch {
      /* ignore */
    }
  }, [])

  const setPhoto = useCallback((value) => {
    setPhotoState(value)
    try {
      if (value) localStorage.setItem(PHOTO_KEY, value)
      else localStorage.removeItem(PHOTO_KEY)
    } catch {
      /* keep in-memory value for this session even if persistence fails */
    }
  }, [])

  const handle = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || 'guest'

  return {
    username,
    setUsername,
    bio,
    setBio,
    photo,
    setPhoto,
    handle,
  }
}

export function getStoredBio() {
  return readStorage(BIO_KEY)
}

export function getStoredProfilePhoto() {
  return readStorage(PHOTO_KEY)
}
