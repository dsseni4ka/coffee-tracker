function formatPlaceName(properties) {
  if (properties.name) return properties.name
  const parts = [properties.street, properties.housenumber].filter(Boolean)
  return parts.join(' ') || 'Unknown place'
}

function formatPlaceSubtitle(properties) {
  const parts = [
    properties.street,
    properties.district,
    properties.city || properties.town || properties.village,
  ].filter(Boolean)
  const unique = [...new Set(parts)]
  return unique.join(', ')
}

function mapPhotonFeature(feature) {
  const { properties, geometry } = feature
  const [lng, lat] = geometry.coordinates

  return {
    id: `${properties.osm_type}-${properties.osm_id}`,
    name: formatPlaceName(properties),
    subtitle: formatPlaceSubtitle(properties),
    type: properties.osm_value || properties.type,
    lat,
    lng,
  }
}

export async function reverseGeocode(lat, lng) {
  if (lat == null || lng == null) return null

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    lang: 'en',
  })

  try {
    const res = await fetch(`https://photon.komoot.io/reverse?${params}`)
    if (!res.ok) return null

    const data = await res.json()
    const feature = data.features?.[0]
    return feature ? mapPhotonFeature(feature) : null
  } catch {
    return null
  }
}

export async function searchPlaces(query, center, limit = 6) {
  const q = query.trim()
  if (q.length < 2) return []

  const params = new URLSearchParams({
    q,
    limit: String(limit),
    lang: 'en',
  })

  if (center?.lat != null && center?.lng != null) {
    params.set('lat', String(center.lat))
    params.set('lon', String(center.lng))
  }

  try {
    const res = await fetch(`https://photon.komoot.io/api/?${params}`)
    if (!res.ok) return []

    const data = await res.json()
    return (data.features ?? []).map(mapPhotonFeature)
  } catch {
    return []
  }
}
