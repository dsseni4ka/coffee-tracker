import { useState } from 'react'
import { SettingsIcon, StatsIcon } from './icons/NavIcons'
import SettingsSheet from './SettingsSheet'
import StatsSheet from './StatsSheet'

export default function AppTopBar() {
  const [showSettings, setShowSettings] = useState(false)
  const [showStats, setShowStats] = useState(false)

  return (
    <>
      <div className="app-topbar" aria-label="App actions">
        <button
          type="button"
          className="app-topbar-btn"
          aria-label="Settings"
          onClick={() => setShowSettings(true)}
        >
          <SettingsIcon size="sm" />
        </button>
        <button
          type="button"
          className="app-topbar-btn app-topbar-btn--stats"
          aria-label="Coffee statistics"
          onClick={() => setShowStats(true)}
        >
          <StatsIcon size="sm" />
        </button>
      </div>

      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
      {showStats && <StatsSheet onClose={() => setShowStats(false)} />}
    </>
  )
}
