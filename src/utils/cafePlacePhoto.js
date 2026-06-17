const photoCache = new Map()

function getCacheKey(name, lat, lng) {
  return `${name}|${lat ?? ''}|${lng ?? ''}`
}

function getCafePhotoMediaUrl(photoName, apiKey, { maxHeight = 200, maxWidth = 300 } = {}) {
  const params = new URLSearchParams({
    maxHeightPx: String(maxHeight),
    maxWidthPx: String(maxWidth),
    key: apiKey,
  })
  return `https://places.googleapis.com/v1/${photoName}/media?${params}`
}

export async function fetchCafePhotoUrl({ name, lat, lng, query }, apiKey) {
  if (!apiKey || !name?.trim()) return null

  const cacheKey = getCacheKey(name, lat, lng)
  if (photoCache.has(cacheKey)) return photoCache.get(cacheKey)

  const body = {
    textQuery: query?.trim() || `${name.trim()} café`,
    maxResultCount: 1,
  }

  if (lat != null && lng != null) {
    body.locationBias = {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 2000,
      },
    }
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.photos',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      photoCache.set(cacheKey, null)
      return null
    }

    const data = await res.json()
    const photoName = data.places?.[0]?.photos?.[0]?.name
    if (!photoName) {
      photoCache.set(cacheKey, null)
      return null
    }

    const url = getCafePhotoMediaUrl(photoName, apiKey)
    photoCache.set(cacheKey, url)
    return url
  } catch {
    photoCache.set(cacheKey, null)
    return null
  }
}
