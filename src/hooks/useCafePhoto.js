import { useEffect, useState } from 'react'
import { fetchCafePhotoUrl } from '../utils/cafePlacePhoto'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export function useCafePhoto({ name, lat, lng, query }, enabled = true) {
  const [photoUrl, setPhotoUrl] = useState(null)
  const [loading, setLoading] = useState(Boolean(enabled && GOOGLE_MAPS_API_KEY && name))

  useEffect(() => {
    if (!enabled || !GOOGLE_MAPS_API_KEY || !name?.trim()) {
      setPhotoUrl(null)
      setLoading(false)
      return undefined
    }

    let cancelled = false
    setLoading(true)

    fetchCafePhotoUrl({ name, lat, lng, query }, GOOGLE_MAPS_API_KEY).then((url) => {
      if (!cancelled) {
        setPhotoUrl(url)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [name, lat, lng, query, enabled])

  return { photoUrl, loading, hasApiKey: Boolean(GOOGLE_MAPS_API_KEY) }
}
