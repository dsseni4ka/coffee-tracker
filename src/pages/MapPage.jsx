import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { format } from 'date-fns'
import { getAllDrinks, getDrinksWithLocation } from '../db/database'
import { getDrinkType } from '../data/drinkTypes'
import { MapController, MapFocusController, MapLocateBridge } from '../components/MapController'
import {
  createCoffeeMarkerIcon,
  createNearbyCafeMarkerIcon,
  createUserLocationIcon,
  MAP_TILES,
} from '../utils/mapMarkers'
import { getCurrentPosition, searchNearbyCafes } from '../utils/nearbyCafeSearch'
import { computeFavoriteCafes } from '../utils/favoriteCafes'

const DEFAULT_CENTER = [52.3676, 4.9041]
const DEFAULT_ZOOM = 14

const nearbyCafeIcon = createNearbyCafeMarkerIcon()
const userLocationIcon = createUserLocationIcon()

function getCafeLogoLetter(name) {
  const cleaned = name.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '').trim()
  const letter = cleaned[0]
  return letter ? letter.toUpperCase() : '☕'
}

function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function getNearbyAmenityLabel(amenity) {
  if (amenity === 'bakery') return 'Bakery'
  if (amenity === 'coffee_shop') return 'Coffee shop'
  return 'Café'
}

function getCafeListId(cafe) {
  return cafe.id ?? cafe.name
}

function NearbyCafeMarker({ cafe, selected, icon }) {
  const markerRef = useRef(null)

  useEffect(() => {
    if (selected && markerRef.current) {
      markerRef.current.openPopup()
    }
  }, [selected])

  return (
    <Marker ref={markerRef} position={[cafe.lat, cafe.lng]} icon={icon}>
      <Popup>
        <div className="coffee-map-popup-inner">
          <span className="coffee-map-popup-emoji">☕</span>
          <div>
            <strong>{cafe.name}</strong>
            <p>Café nearby</p>
            {cafe.address && <p>{cafe.address}</p>}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

export default function MapPage() {
  const mapCardRef = useRef(null)
  const locateRef = useRef(null)
  const [drinks, setDrinks] = useState([])
  const [allDrinks, setAllDrinks] = useState([])
  const [userCenter, setUserCenter] = useState(null)
  const [nearbyCafes, setNearbyCafes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchingNearby, setSearchingNearby] = useState(false)
  const [nearbyMessage, setNearbyMessage] = useState(null)
  const [nearbyListActive, setNearbyListActive] = useState(false)
  const [selectedCafeId, setSelectedCafeId] = useState(null)
  const [mapFocus, setMapFocus] = useState(null)
  const [mapMounted, setMapMounted] = useState(false)

  useEffect(() => {
    setMapMounted(true)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [withLocation, all] = await Promise.all([
        getDrinksWithLocation(),
        getAllDrinks(),
      ])
      if (!cancelled) {
        setDrinks(withLocation)
        setAllDrinks(all)
        setLoading(false)
      }
    }

    load()

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled) {
            setUserCenter([pos.coords.latitude, pos.coords.longitude])
          }
        },
        () => {},
        { timeout: 5000, enableHighAccuracy: true }
      )
    }

    return () => {
      cancelled = true
    }
  }, [])

  const favoriteCafes = useMemo(() => computeFavoriteCafes(allDrinks), [allDrinks])

  const nearbyCafesWithDistance = useMemo(() => {
    if (!userCenter) return nearbyCafes.map((cafe) => ({ ...cafe, distance: null }))

    const [userLat, userLng] = userCenter
    return nearbyCafes
      .map((cafe) => ({
        ...cafe,
        distance: distanceMeters(userLat, userLng, cafe.lat, cafe.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
  }, [nearbyCafes, userCenter])

  const handleCafeFocus = useCallback((cafe) => {
    if (cafe.lat == null || cafe.lng == null) return

    setSelectedCafeId(getCafeListId(cafe))
    setMapFocus({ lat: cafe.lat, lng: cafe.lng, key: Date.now() })
    mapCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleFindNearby = useCallback(async () => {
    setSearchingNearby(true)
    setNearbyMessage(null)
    setSelectedCafeId(null)
    setMapFocus(null)

    try {
      const pos = await getCurrentPosition()
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setUserCenter([lat, lng])

      const cafes = await searchNearbyCafes(lat, lng)
      setNearbyCafes(cafes)
      setNearbyListActive(true)

      if (cafes.length === 0) {
        setNearbyMessage('No cafés found within 1.2 km. Try moving to a busier area.')
      } else {
        setNearbyMessage(`${cafes.length} café${cafes.length !== 1 ? 's' : ''} found nearby`)
      }
    } catch {
      setNearbyMessage('Could not find your location. Allow location access and try again.')
      setNearbyCafes([])
      setNearbyListActive(false)
    } finally {
      setSearchingNearby(false)
    }
  }, [])

  const handleShowFavorites = useCallback(() => {
    setNearbyListActive(false)
    setNearbyCafes([])
    setNearbyMessage(null)
    setSelectedCafeId(null)
    setMapFocus(null)
  }, [])

  const drinkMarkers = useMemo(
    () =>
      drinks.map((d) => ({
        drink: d,
        icon: createCoffeeMarkerIcon(d.drinkType),
      })),
    [drinks]
  )

  return (
    <div className="map-page">
      <h1 className="page-title">Map</h1>
      <p className="page-subtitle">Where you have been drinking coffee</p>

      <div ref={mapCardRef} className="map-page-card card">
        {mapMounted && (
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom
            zoomControl={false}
            className="map-page-leaflet"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution={MAP_TILES.attribution}
              url={MAP_TILES.url}
              subdomains={MAP_TILES.subdomains}
              maxZoom={MAP_TILES.maxZoom}
              updateWhenIdle
            />
            <MapController
              drinks={drinks}
              userCenter={userCenter}
              nearbyCafes={nearbyCafes}
              defaultZoom={DEFAULT_ZOOM}
            />
            <MapFocusController focus={mapFocus} />
            <MapLocateBridge userCenter={userCenter} locateRef={locateRef} />

            {userCenter && (
              <Marker position={userCenter} icon={userLocationIcon} zIndexOffset={-100}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {nearbyCafes.map((cafe) => (
              <NearbyCafeMarker
                key={cafe.id}
                cafe={cafe}
                icon={nearbyCafeIcon}
                selected={selectedCafeId === cafe.id}
              />
            ))}

            {drinkMarkers.map(({ drink, icon }) => {
              const type = getDrinkType(drink.drinkType)
              return (
                <Marker key={drink.id} position={[drink.lat, drink.lng]} icon={icon}>
                  <Popup>
                    <div className="coffee-map-popup-inner">
                      <span className="coffee-map-popup-emoji">{type?.emoji ?? '☕'}</span>
                      <div>
                        <strong>{type?.label ?? 'Coffee'}</strong>
                        <p>Your log · {format(new Date(drink.timestamp), 'MMM d, yyyy · HH:mm')}</p>
                        {drink.caffeine != null && <p>{drink.caffeine} mg caffeine</p>}
                        {drink.placeName && <p>{drink.placeName}</p>}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        )}
        <div className="map-floating-controls" aria-hidden={!mapMounted}>
          <button
            type="button"
            className="map-floating-btn map-floating-btn--locate"
            aria-label="Center on my location"
            disabled={!userCenter}
            onClick={() => locateRef.current?.()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2v3M12 19v3M2 12h3M19 12h3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <button
        type="button"
        className="add-cup-btn map-nearby-btn"
        onClick={handleFindNearby}
        disabled={searchingNearby}
      >
        {searchingNearby ? 'Looking for cafés…' : 'Look for cafés nearby'}
      </button>

      {nearbyMessage && (
        <p className="map-page-meta map-page-meta--highlight">{nearbyMessage}</p>
      )}

      <section className="map-favorites-section">
        <div className="map-favorites-header">
          <h2 className="map-favorites-title">
            {nearbyListActive ? 'Cafés Nearby' : 'Favourite Spots'}
          </h2>
          {nearbyListActive && (
            <button
              type="button"
              className="map-favorites-back"
              onClick={handleShowFavorites}
            >
              Favourite spots
            </button>
          )}
        </div>

        {nearbyListActive ? (
          nearbyCafesWithDistance.length === 0 ? (
            <div className="home-card map-favorites-empty-card">
              <p className="map-favorites-empty">
                No cafés found nearby. Try again in a busier area or move closer to town.
              </p>
            </div>
          ) : (
            <div className="map-favorites-cards">
              {nearbyCafesWithDistance.map((cafe) => (
                <button
                  key={cafe.id}
                  type="button"
                  className={`home-card map-favorite-card map-favorite-card--clickable${
                    selectedCafeId === cafe.id ? ' map-favorite-card--selected' : ''
                  }`}
                  onClick={() => handleCafeFocus(cafe)}
                >
                  <div className="map-favorite-card-logo" aria-hidden>
                    {getCafeLogoLetter(cafe.name)}
                  </div>
                  <div className="map-favorite-card-body">
                    <h3 className="map-favorite-card-name">{cafe.name}</h3>
                    <p className="map-favorite-card-drink">
                      {cafe.address || getNearbyAmenityLabel(cafe.amenity)}
                    </p>
                  </div>
                  {cafe.distance != null && (
                    <span className="map-favorite-card-cups">
                      {formatDistance(cafe.distance)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )
        ) : favoriteCafes.length === 0 ? (
          <div className="home-card map-favorites-empty-card">
            <p className="map-favorites-empty">
              Log coffee with a café or place name to see your favourite spots here.
            </p>
          </div>
        ) : (
          <div className="map-favorites-cards">
            {favoriteCafes.map((cafe) => {
              const hasLocation = cafe.lat != null && cafe.lng != null
              const CardTag = hasLocation ? 'button' : 'article'
              const cardProps = hasLocation
                ? {
                    type: 'button',
                    onClick: () => handleCafeFocus(cafe),
                    className: `home-card map-favorite-card map-favorite-card--clickable${
                      selectedCafeId === cafe.name ? ' map-favorite-card--selected' : ''
                    }`,
                  }
                : { className: 'home-card map-favorite-card' }

              return (
                <CardTag key={cafe.name} {...cardProps}>
                  <div className="map-favorite-card-logo" aria-hidden>
                    {getCafeLogoLetter(cafe.name)}
                  </div>
                  <div className="map-favorite-card-body">
                    <h3 className="map-favorite-card-name">{cafe.name}</h3>
                    {cafe.topDrink && (
                      <p className="map-favorite-card-drink">
                        Usually {cafe.topDrink.emoji} {cafe.topDrink.label}
                      </p>
                    )}
                  </div>
                  <span className="map-favorite-card-cups">
                    {cafe.cups} cup{cafe.cups !== 1 ? 's' : ''}
                  </span>
                </CardTag>
              )
            })}
          </div>
        )}
      </section>

      {loading && <p className="map-page-meta">Loading map…</p>}
    </div>
  )
}
