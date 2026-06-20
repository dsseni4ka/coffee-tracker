import { useEffect, useRef, useState } from 'react'
import { DRINK_STICKER_OPTIONS, PRICE_RULER } from '../../data/sipSpendDrinks'
import { useCustomDrinkStickers } from '../../hooks/useCustomDrinkStickers'
import { formatPrice } from '../../utils/format'
import { CupStickerImage } from './CoffeeCupSvgs'
import TallyAmount from './TallyAmount'
import PriceRuler from './PriceRuler'

const { start: START_PRICE, end: END_PRICE } = PRICE_RULER
const IS_TOUCH_DEVICE =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

function scrollInputIntoView(input) {
  window.setTimeout(() => {
    input.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, 320)
}

export default function CustomDrinkPanel({ onBack, onSave }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState(4.5)
  const [sticker, setSticker] = useState(DRINK_STICKER_OPTIONS[0].src)
  const [editingStickers, setEditingStickers] = useState(false)
  const rulerRef = useRef(null)
  const stickerFileRef = useRef(null)
  const nameInputRef = useRef(null)
  const { visibleStickers, addCustomSticker, removeSticker } = useCustomDrinkStickers()

  const trimmedName = name.trim()
  const canSave = trimmedName.length > 0 && price >= START_PRICE && price <= END_PRICE

  function adjustPrice(delta) {
    const next = parseFloat(Math.max(START_PRICE, Math.min(END_PRICE, price + delta)).toFixed(2))
    setPrice(next)
    rulerRef.current?.scrollToPrice(next)
  }

  function handleSave() {
    if (!canSave) return
    onSave({ name: trimmedName, basePrice: price, sticker })
  }

  async function handleStickerUpload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      const nextSticker = await addCustomSticker(file)
      setSticker(nextSticker.src)
    } catch {
      /* ignore invalid uploads */
    }
  }

  function handleRemoveSticker(option) {
    if (visibleStickers.length <= 1) return

    const fallback = visibleStickers.find((item) => item.id !== option.id)
    removeSticker(option)

    if (sticker === option.src && fallback) {
      setSticker(fallback.src)
    }
  }

  function toggleStickerEdit() {
    setEditingStickers((value) => !value)
  }

  useEffect(() => {
    if (IS_TOUCH_DEVICE || !nameInputRef.current) return undefined
    nameInputRef.current.focus()
    return undefined
  }, [])

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
          ref={nameInputRef}
          id="custom-drink-name"
          type="text"
          className="add-coffee-pill-input sipspend-custom-name-input"
          placeholder="e.g. Oat Flat White"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => scrollInputIntoView(e.currentTarget)}
          maxLength={32}
          enterKeyHint="done"
          autoComplete="off"
        />

        <div className="sipspend-sticker-picker-header">
          <label className="add-coffee-field-label sipspend-sticker-picker-label">Pick a sticker</label>
          <button
            type="button"
            className={`sipspend-sticker-picker-edit${editingStickers ? ' sipspend-sticker-picker-edit--active' : ''}`}
            onClick={toggleStickerEdit}
            aria-pressed={editingStickers}
          >
            {editingStickers ? 'Done' : 'Edit'}
          </button>
        </div>
        <input
          ref={stickerFileRef}
          type="file"
          accept="image/*"
          onChange={handleStickerUpload}
          hidden
        />
        <div
          className={`sipspend-sticker-picker${editingStickers ? ' sipspend-sticker-picker--editing' : ''}`}
          role="listbox"
          aria-label="Drink sticker"
        >
          {visibleStickers.map((option) => (
            <div key={option.id} className="sipspend-sticker-option-wrap">
              <button
                type="button"
                role="option"
                aria-selected={sticker === option.src}
                className={`sipspend-sticker-option${sticker === option.src ? ' selected' : ''}`}
                onClick={() => {
                  if (!editingStickers) setSticker(option.src)
                }}
                disabled={editingStickers}
              >
                <CupStickerImage src={option.src} alt={option.label} />
              </button>
              {editingStickers && (
                <button
                  type="button"
                  className="sipspend-sticker-option-remove"
                  onClick={() => handleRemoveSticker(option)}
                  disabled={visibleStickers.length <= 1}
                  aria-label={`Remove ${option.label} sticker`}
                >
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="sipspend-sticker-option sipspend-sticker-option--add"
            onClick={() => stickerFileRef.current?.click()}
            aria-label="Add custom sticker"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
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
          <PriceRuler ref={rulerRef} price={price} onPriceChange={setPrice} />
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
