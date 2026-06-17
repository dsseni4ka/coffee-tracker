import { useEffect, useRef, useState } from 'react'
import { addPost } from '../db/database'
import MapPickerModal from './MapPickerModal'
import CafeSearchInput from './CafeSearchInput'

export default function ShareMomentSheet({ onClose, onPosted }) {
  const [caption, setCaption] = useState('')
  const [photo, setPhoto] = useState(null)
  const [cafeName, setCafeName] = useState('')
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchCenter, setSearchCenter] = useState(null)

  const fileRef = useRef(null)

  useEffect(() => {
    if (lat != null && lng != null) return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSearchCenter({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        },
        () => {},
        { timeout: 8000, enableHighAccuracy: true }
      )
    }
  }, [lat, lng])

  const placeSearchCenter = lat != null && lng != null ? { lat, lng } : searchCenter

  function handlePhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  async function handlePost() {
    if (!photo && !caption.trim()) return

    setSaving(true)
    await addPost({
      caption: caption.trim(),
      photo,
      cafeName: cafeName.trim(),
      lat,
      lng,
    })
    setSaving(false)
    onPosted?.()
    onClose?.()
  }

  const canPost = Boolean(photo || caption.trim())

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} role="presentation">
        <div
          className="sheet sheet--add-coffee"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="Share a moment"
        >
          <div className="sheet-handle" aria-hidden />

          <header className="sheet-toolbar">
            <button type="button" className="add-coffee-text-btn" onClick={onClose}>
              Cancel
            </button>
            <h2 className="sheet-toolbar-title">Share a moment</h2>
            <button
              type="button"
              className="add-coffee-text-btn add-coffee-text-btn--primary"
              onClick={handlePost}
              disabled={saving || !canPost}
            >
              {saving ? 'Posting…' : 'Post'}
            </button>
          </header>

          <div className="add-coffee-body">
            <label className="add-coffee-field-label">Photo</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhoto}
              hidden
            />
            <button
              type="button"
              className="add-coffee-photo"
              onClick={() => fileRef.current?.click()}
            >
              {photo ? (
                <img src={photo} alt="Preview" className="add-coffee-photo-preview" />
              ) : (
                <>
                  <strong>Add a photo</strong>
                  <span>Tap to choose from camera or gallery</span>
                </>
              )}
            </button>

            <label className="add-coffee-field-label">Caption</label>
            <textarea
              className="add-coffee-notes"
              placeholder="What made this coffee moment special?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
            />

            <label className="add-coffee-field-label">Location</label>
            <CafeSearchInput
              value={cafeName}
              onChange={setCafeName}
              center={placeSearchCenter}
              onSelectPlace={(place) => {
                if (place) {
                  setLat(place.lat)
                  setLng(place.lng)
                } else {
                  setLat(null)
                  setLng(null)
                }
              }}
            />
            <div className="add-coffee-location-actions">
              <button
                type="button"
                className="add-coffee-map-btn add-coffee-map-btn--wide"
                onClick={() => setShowMap(true)}
                aria-label="Pick on map"
              >
                Pick on map
              </button>
            </div>
            {lat != null && lng != null && (
              <p className="add-coffee-map-coords">
                📍 {cafeName || 'Location'} · {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            )}
          </div>

          <div className="sheet-footer">
            <button
              type="button"
              className="add-cup-btn sheet-submit-btn"
              onClick={handlePost}
              disabled={saving || !canPost}
            >
              {saving ? 'Posting…' : 'Share moment'}
            </button>
          </div>
        </div>
      </div>

      {showMap && (
        <MapPickerModal
          initialLat={lat}
          initialLng={lng}
          onClose={() => setShowMap(false)}
          onConfirm={(newLat, newLng) => {
            setLat(newLat)
            setLng(newLng)
            setShowMap(false)
          }}
        />
      )}
    </>
  )
}
