import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

function collectMapPoints(drinks, userCenter, nearbyCafes) {
  const points = []
  if (userCenter) points.push(userCenter)
  for (const d of drinks) points.push([d.lat, d.lng])
  for (const c of nearbyCafes) points.push([c.lat, c.lng])
  return points
}

export function MapFocusController({ focus }) {
  const map = useMap()

  useEffect(() => {
    if (!focus) return
    map.flyTo([focus.lat, focus.lng], focus.zoom ?? 17, { duration: 0.55 })
  }, [focus, map])

  return null
}

export function MapController({ drinks, userCenter, nearbyCafes = [], defaultZoom = 14 }) {
  const map = useMap()
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname !== '/map') return

    function refreshMap() {
      map.invalidateSize({ animate: false })

      const points = collectMapPoints(drinks, userCenter, nearbyCafes)

      if (nearbyCafes.length > 0 && points.length > 0) {
        map.fitBounds(L.latLngBounds(points), { padding: [52, 52], maxZoom: 16 })
        return
      }

      if (drinks.length > 0) {
        const bounds = L.latLngBounds(drinks.map((d) => [d.lat, d.lng]))
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 })
        return
      }

      if (userCenter) {
        map.setView(userCenter, defaultZoom)
      }
    }

    refreshMap()
    const t1 = requestAnimationFrame(refreshMap)
    const t2 = setTimeout(refreshMap, 150)
    const t3 = setTimeout(refreshMap, 500)

    window.addEventListener('resize', refreshMap)
    return () => {
      cancelAnimationFrame(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener('resize', refreshMap)
    }
  }, [pathname, drinks, userCenter, nearbyCafes, map, defaultZoom])

  return null
}

export function MapPickerController() {
  const map = useMap()

  useEffect(() => {
    function refresh() {
      map.invalidateSize({ animate: false })
    }
    refresh()
    const t = setTimeout(refresh, 150)
    window.addEventListener('resize', refresh)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', refresh)
    }
  }, [map])

  return null
}
