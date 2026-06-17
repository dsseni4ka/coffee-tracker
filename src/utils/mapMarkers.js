import L from 'leaflet'
import { getDrinkEmoji } from '../data/drinkTypes'

export function createCoffeeMarkerIcon(drinkType) {
  const emoji = getDrinkEmoji(drinkType)
  return L.divIcon({
    className: 'coffee-map-marker',
    html: `<span class="coffee-map-marker-emoji" aria-hidden="true">${emoji}</span>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  })
}

export function createNearbyCafeMarkerIcon() {
  return L.divIcon({
    className: 'coffee-map-marker nearby-cafe-marker',
    html: `<span class="nearby-cafe-marker-emoji" aria-hidden="true">☕</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  })
}

export function createUserLocationIcon() {
  return L.divIcon({
    className: 'user-location-marker',
    html: '<span class="user-location-dot" aria-hidden="true"></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

export const MAP_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20,
}
