import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SettingsIcon } from './icons/NavIcons'
import SettingsSheet from './SettingsSheet'

function getPageTitle(pathname) {
  if (pathname.startsWith('/map')) return 'Map'
  if (pathname.startsWith('/profile')) return 'Budget'
  return 'Calendar'
}

export default function AppTopBar() {
  const { pathname } = useLocation()
  const [showSettings, setShowSettings] = useState(false)
  const pageTitle = getPageTitle(pathname)

  return (
    <>
      <div className="app-topbar" aria-label="App actions">
        <h1 className="app-topbar-title">{pageTitle}</h1>
        <button
          type="button"
          className="app-topbar-btn"
          aria-label="Settings"
          onClick={() => setShowSettings(true)}
        >
          <SettingsIcon size="sm" />
        </button>
      </div>

      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
    </>
  )
}
