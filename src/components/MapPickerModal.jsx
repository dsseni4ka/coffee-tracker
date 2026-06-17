import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { createCoffeeMarkerIcon, MAP_TILES } from '../utils/mapMarkers'
import { MapPickerController } from './MapController'

const DEFAULT_CENTER = [52.3676, 4.9041]

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapPickerModal({ initialLat, initialLng, onConfirm, onClose }) {
  const [position, setPosition] = useState(
    initialLat != null && initialLng != null ? [initialLat, initialLng] : null
  )
  const [center, setCenter] = useState(
    initialLat != null && initialLng != null ? [initialLat, initialLng] : DEFAULT_CENTER
  )

  useEffect(() => {
    if (position) return
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = [pos.coords.latitude, pos.coords.longitude]
          setCenter(c)
        },
        () => {},
        { timeout: 5000 }
      )
    }
  }, [position])

  function handlePick(lat, lng) {
    setPosition([lat, lng])
  }

  return (
    <div className="map-picker-overlay" role="presentation">
      <div className="map-picker-sheet" role="dialog" aria-label="Pick location on map">
        <div className="map-picker-header">
          <button type="button" className="add-coffee-text-btn" onClick={onClose}>
            Cancel
          </button>
          <span className="map-picker-title">Pick on map</span>
          <button
            type="button"
            className="add-coffee-text-btn add-coffee-text-btn--primary"
            disabled={!position}
            onClick={() => position && onConfirm(position[0], position[1])}
          >
            Done
          </button>
        </div>
        <p className="map-picker-hint">Tap the map to drop a pin where you had your coffee.</p>
        <div className="map-picker-map">
          <MapContainer center={center} zoom={14} scrollWheelZoom className="map-picker-leaflet" style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution={MAP_TILES.attribution}
              url={MAP_TILES.url}
              subdomains={MAP_TILES.subdomains}
              maxZoom={MAP_TILES.maxZoom}
            />
            <MapPickerController />
            <MapClickHandler onPick={handlePick} />
            {position && <Marker position={position} icon={createCoffeeMarkerIcon('latte')} />}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
