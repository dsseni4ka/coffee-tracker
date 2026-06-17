import { useRef, useState } from 'react'
import PhoneLinkCard from './PhoneLinkCard'
import UsernameLabel from './UsernameLabel'
import { useTheme } from '../hooks/useTheme'
import { isProfilePhotoFile, prepareProfilePhoto } from '../utils/profilePhoto'

const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'matcha', label: 'Matcha latte' },
]

const MAX_PHOTO_BYTES = 12 * 1024 * 1024

export default function SettingsSheet({
  onClose,
  photo,
  setPhoto,
  username,
  setUsername,
}) {
  const [theme, setTheme] = useTheme()
  const [photoError, setPhotoError] = useState('')
  const photoFileRef = useRef(null)
  const initial = (username?.trim()?.[0] ?? 'G').toUpperCase()

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    setPhotoError('')

    if (!isProfilePhotoFile(file)) {
      setPhotoError('Please choose an image file.')
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Image is too large. Try a smaller photo.')
      return
    }

    try {
      const dataUrl = await prepareProfilePhoto(file)
      setPhoto(dataUrl)
    } catch {
      setPhotoError('Could not use that photo. Try another image.')
    }
  }

  return (
    <div className="sheet-overlay" onClick={onClose} role="presentation">
      <div
        className="sheet sheet--add-coffee"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Settings"
      >
        <div className="sheet-handle" aria-hidden />

        <header className="sheet-toolbar">
          <button type="button" className="add-coffee-text-btn" onClick={onClose}>
            Close
          </button>
          <h2 className="sheet-toolbar-title">Settings</h2>
          <span className="add-coffee-text-btn add-coffee-text-btn--spacer" aria-hidden />
        </header>

        <div className="add-coffee-body settings-sheet-body">
          <label className="add-coffee-field-label">Profile</label>
          <div className="settings-profile-card">
            <button
              type="button"
              className="settings-profile-avatar-btn"
              onClick={() => photoFileRef.current?.click()}
              aria-label={photo ? 'Change profile photo' : 'Add profile photo'}
            >
              {photo ? (
                <img src={photo} alt="" className="settings-profile-avatar-img" />
              ) : (
                <span className="settings-profile-avatar-initial" aria-hidden>
                  {initial}
                </span>
              )}
              <span className="settings-profile-avatar-plus" aria-hidden>
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
            </button>
            <input
              ref={photoFileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              hidden
            />
            <div className="settings-profile-copy">
              <span className="settings-profile-label">Display name</span>
              <UsernameLabel username={username} onSave={setUsername} />
              {photoError && <p className="settings-profile-photo-error">{photoError}</p>}
            </div>
          </div>

          <label className="add-coffee-field-label">Theme</label>
          <div className="add-coffee-pill-group">
            {THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`add-coffee-pill${theme === item.id ? ' selected' : ''}`}
                onClick={() => setTheme(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <PhoneLinkCard />
        </div>
      </div>
    </div>
  )
}
