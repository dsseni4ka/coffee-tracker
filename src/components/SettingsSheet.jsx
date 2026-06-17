import PhoneLinkCard from './PhoneLinkCard'
import UsernameLabel from './UsernameLabel'
import { useProfile } from '../hooks/useProfile'
import { useTheme } from '../hooks/useTheme'

const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

export default function SettingsSheet({ onClose }) {
  const { username, setUsername } = useProfile()
  const [theme, setTheme] = useTheme()

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
            <span className="settings-profile-avatar" aria-hidden>
              {(username?.trim()?.[0] ?? 'G').toUpperCase()}
            </span>
            <div className="settings-profile-copy">
              <span className="settings-profile-label">Display name</span>
              <UsernameLabel username={username} onSave={setUsername} />
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
