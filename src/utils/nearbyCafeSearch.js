export async function searchNearbyCafes(lat, lng, radiusMeters = 1200) {
  const query = `[out:json][timeout:25];
(
  node["amenity"~"cafe|coffee_shop|bakery"]["name"](around:${radiusMeters},${lat},${lng});
  way["amenity"~"cafe|coffee_shop"]["name"](around:${radiusMeters},${lat},${lng});
);
out center 35;`

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  if (!res.ok) throw new Error('Cafe search failed')

  const data = await res.json()
  const seen = new Set()

  return data.elements
    .map((el) => {
      const placeLat = el.lat ?? el.center?.lat
      const placeLng = el.lon ?? el.center?.lon
      const name = el.tags?.name
      if (placeLat == null || placeLng == null || !name) return null

      const key = `${name}-${placeLat.toFixed(5)}-${placeLng.toFixed(5)}`
      if (seen.has(key)) return null
      seen.add(key)

      const address = [el.tags['addr:street'], el.tags['addr:city'] || el.tags['addr:town']]
        .filter(Boolean)
        .join(', ')

      return {
        id: `${el.type}-${el.id}`,
        name,
        amenity: el.tags.amenity,
        lat: placeLat,
        lng: placeLng,
        address,
      }
    })
    .filter(Boolean)
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 12000,
      enableHighAccuracy: true,
      maximumAge: 60000,
    })
  })
}
