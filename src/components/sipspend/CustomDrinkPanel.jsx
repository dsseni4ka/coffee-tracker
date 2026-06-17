import { useState } from 'react'
import { DRINK_STICKER_OPTIONS, PRICE_RULER } from '../../data/sipSpendDrinks'
import { formatPrice } from '../../utils/format'
import { CupStickerImage } from './CoffeeCupSvgs'
import TallyAmount from './TallyAmount'

const { start: START_PRICE, end: END_PRICE } = PRICE_RULER

export default function CustomDrinkPanel({ onBack, onSave }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState(4.5)
  const [sticker, setSticker] = useState(DRINK_STICKER_OPTIONS[0].src)

  const trimmedName = name.trim()
  const canSave = trimmedName.length > 0 && price >= START_PRICE && price <= END_PRICE

  function adjustPrice(delta) {
    const next = parseFloat(Math.max(START_PRICE, Math.min(END_PRICE, price + delta)).toFixed(2))
    setPrice(next)
  }

  function handleSave() {
    if (!canSave) return
    onSave({ name: trimmedName, basePrice: price, sticker })
  }

  return (
    <>
      <header className="sheet-toolbar sipspend-subview-toolbar">
        <button type="button" className="add-coffee-text-btn" onClick={onBack}>
          Back
        </button>
        <h2 className="sheet-toolbar-title">Custom Drink</h2>
        <span className="add-coffee-text-btn add-coffee-text-btn--spacer" aria-hidden />
      </header>

      <div className="sipspend-subview-body">
        <label className="add-coffee-field-label" htmlFor="custom-drink-name">
          Name
        </label>
        <input
          id="custom-drink-name"
          type="text"
          className="add-coffee-pill-input sipspend-custom-name-input"
          placeholder="e.g. Oat Flat White"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={32}
          autoFocus
        />

        <label className="add-coffee-field-label">Pick a sticker</label>
        <div className="sipspend-sticker-picker" role="listbox" aria-label="Drink sticker">
          {DRINK_STICKER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="option"
              aria-selected={sticker === option.src}
              className={`sipspend-sticker-option${sticker === option.src ? ' selected' : ''}`}
              onClick={() => setSticker(option.src)}
            >
              <CupStickerImage src={option.src} alt={option.label} />
            </button>
          ))}
        </div>

        <label className="add-coffee-field-label">Default price</label>
        <div className="sipspend-price-box sipspend-custom-price-box">
          <div className="sipspend-price-controls">
            <button
              type="button"
              className="sipspend-price-btn"
              onClick={() => adjustPrice(-0.05)}
              aria-label="Decrease price"
            >
              −
            </button>
            <div className="sipspend-price-display">
              <span className="currency">€</span>
              <TallyAmount value={price} />
            </div>
            <button
              type="button"
              className="sipspend-price-btn"
              onClick={() => adjustPrice(0.05)}
              aria-label="Increase price"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="sipspend-footer">
        <button
          type="button"
          className="sipspend-log-btn"
          onClick={handleSave}
          disabled={!canSave}
        >
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add {trimmedName || 'Drink'} ({formatPrice(price)})</span>
        </button>
      </div>
    </>
  )
}
