import { useState } from 'react'
import { format } from 'date-fns'
import { DRINK_TYPES, getDrinkType, getCaffeineForDrink } from '../data/drinkTypes'
import { addDrink } from '../db/database'
import DrinkSticker from './DrinkSticker'

const SIZES = [
  { value: 0.5, label: 'Small' },
  { value: 1, label: 'Regular' },
  { value: 1.5, label: 'Large' },
]

export default function DrinkForm({ onSaved }) {
  const [drinkType, setDrinkType] = useState('latte')
  const [size, setSize] = useState(1)
  const [notes, setNotes] = useState('')
  const [placeName, setPlaceName] = useState('')
  const [saving, setSaving] = useState(false)
  const [useLocation, setUseLocation] = useState(true)

  const selected = getDrinkType(drinkType)
  const previewCaffeine = getCaffeineForDrink(drinkType, size)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    let lat = null
    let lng = null

    if (useLocation && navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        })
        lat = pos.coords.latitude
        lng = pos.coords.longitude
      } catch {
        /* location optional */
      }
    }

    await addDrink({ drinkType, size, notes, placeName, lat, lng })
    setNotes('')
    setPlaceName('')
    setSaving(false)
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>What did you drink?</label>
        <div className="drink-grid">
          {DRINK_TYPES.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`drink-option${drinkType === d.id ? ' selected' : ''}`}
              onClick={() => setDrinkType(d.id)}
            >
              <DrinkSticker drinkType={d.id} size="sm" />
              <span className="drink-option-label">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Size</label>
        <div className="size-options">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`size-option${size === s.value ? ' selected' : ''}`}
              onClick={() => setSize(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="caffeine-preview">
        <div className="caffeine-preview-drink">
          {selected && <DrinkSticker drinkType={selected.id} size="sm" />}
          <strong>{selected?.label}</strong>
        </div>
        <div className="caffeine-preview-value">~{previewCaffeine} mg caffeine</div>
      </div>

      <div className="form-group">
        <label htmlFor="place">Where? (optional)</label>
        <input
          id="place"
          type="text"
          placeholder="e.g. Blue Bottle, home..."
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          placeholder="How was it?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: '0.85rem' }}>
        <input
          type="checkbox"
          checked={useLocation}
          onChange={(e) => setUseLocation(e.target.checked)}
        />
        Save location for map
      </label>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
        {saving ? 'Logging...' : 'Log drink'}
      </button>
    </form>
  )
}

export function DrinkListItem({ drink }) {
  const type = getDrinkType(drink.drinkType)
  const time = format(new Date(drink.timestamp), 'HH:mm')

  return (
    <div className="drink-item">
      <DrinkSticker drinkType={drink.drinkType} size="sm" />
      <div className="drink-item-info">
        <div className="drink-item-name">{type?.label ?? drink.drinkType}</div>
        <div className="drink-item-meta">
          {time}
          {drink.placeName ? ` · ${drink.placeName}` : ''}
          {drink.notes ? ` · ${drink.notes}` : ''}
        </div>
      </div>
      <span className="drink-item-caffeine">{drink.caffeine} mg</span>
    </div>
  )
}
