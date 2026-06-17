import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SettingsIcon } from './icons/NavIcons'
import SettingsSheet from './SettingsSheet'
import { useProfile } from '../hooks/useProfile'

function getPageTitle(pathname) {
  if (pathname.startsWith('/map')) return 'Map'
  if (pathname.startsWith('/profile')) return 'Budget'
  return 'Calendar'
}

export default function AppTopBar() {
  const { pathname } = useLocation()
  const { photo, setPhoto, username, setUsername } = useProfile()
  const [showSettings, setShowSettings] = useState(false)
  const pageTitle = getPageTitle(pathname)

  return (
    <>
      <div className="app-topbar" aria-label="App actions">
        <h1 className="app-topbar-title">{pageTitle}</h1>
        <button
          type="button"
          className={`app-topbar-btn${photo ? ' app-topbar-btn--photo' : ''}`}
          aria-label="Settings"
          onClick={() => setShowSettings(true)}
        >
          {photo ? (
            <img src={photo} alt="" className="app-topbar-avatar" />
          ) : (
            <SettingsIcon size="sm" />
          )}
        </button>
      </div>

      {showSettings && (
        <SettingsSheet
          onClose={() => setShowSettings(false)}
          photo={photo}
          setPhoto={setPhoto}
          username={username}
          setUsername={setUsername}
        />
      )}
    </>
  )
}
