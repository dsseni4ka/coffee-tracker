import L from 'leaflet'
import { getDrinkEmoji } from '../data/drinkTypes'

export function createCoffeeMarkerIcon(drinkType) {
  const emoji = getDrinkEmoji(drinkType)
  return L.divIcon({
    className: 'coffee-map-marker',
    html: `<span class="map-poi-marker map-poi-marker--log" aria-hidden="true">${emoji}</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

export function createNearbyCafeMarkerIcon() {
  return L.divIcon({
    className: 'coffee-map-marker nearby-cafe-marker',
    html: `<span class="map-poi-marker map-poi-marker--cafe" aria-hidden="true">☕</span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

export function createUserLocationIcon() {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <span class="user-location-beam" aria-hidden="true"></span>
      <span class="user-location-pulse" aria-hidden="true"></span>
      <span class="user-location-dot" aria-hidden="true"></span>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  })
}

export const MAP_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20,
}
