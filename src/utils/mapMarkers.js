import L from 'leaflet'
import { getDrinkStickerSrc } from '../data/sipSpendDrinks'

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function getCafeLogoLetter(name) {
  const cleaned = name.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '').trim()
  const letter = cleaned[0]
  return letter ? letter.toUpperCase() : 'C'
}

export function createCoffeeMarkerIcon(drinkType) {
  const src = getDrinkStickerSrc(drinkType)
  return L.divIcon({
    className: 'coffee-map-marker',
    html: `<span class="map-poi-marker map-poi-marker--log" aria-hidden="true"><img src="${src}" alt="" class="map-poi-marker-sticker" draggable="false" /></span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

export function createNearbyCafeMarkerIcon(cafeName) {
  const letter = escapeHtml(getCafeLogoLetter(cafeName))
  return L.divIcon({
    className: 'coffee-map-marker nearby-cafe-marker',
    html: `<span class="map-poi-marker map-poi-marker--cafe" aria-hidden="true"><span class="map-poi-marker-logo">${letter}</span></span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
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
