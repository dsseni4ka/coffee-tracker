import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DRINK_PRICE_PRESETS, PRICE_RULER } from '../../data/sipSpendDrinks'
import { formatPrice } from '../../utils/format'
import { AmountKeypadSheet } from '../BudgetAmountKeypad'
import { CupStickerImage } from './CoffeeCupSvgs'
import '../../styles/budget.css'

const LIST_GAP_PX = 8
const DRAG_ACTIVATE_PX = 6

function DragHandleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="7" r="1.5" />
      <circle cx="15" cy="7" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="17" r="1.5" />
      <circle cx="15" cy="17" r="1.5" />
    </svg>
  )
}

function EyeIcon({ off = false }) {
  if (off) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.9 9.9 0 0112 5c4.5 0 8.2 3 9 7a9.8 9.8 0 01-4.1 5.1M6.7 6.7A9.9 9.9 0 003 12c.8 4 4.5 7 9 7 1.1 0 2.1-.2 3.1-.5" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  )
}

function reorderItems(items, fromIndex, toIndex) {
  if (fromIndex === toIndex) return items
  const copy = [...items]
  const [item] = copy.splice(fromIndex, 1)
  copy.splice(toIndex, 0, item)
  return copy
}

function getRowShift(index, drag) {
  if (!drag?.active) return 0

  const { fromIndex, hoverIndex, rowStride } = drag

  if (fromIndex < hoverIndex) {
    if (index > fromIndex && index <= hoverIndex) return -rowStride
  } else if (fromIndex > hoverIndex) {
    if (index >= hoverIndex && index < fromIndex) return rowStride
  }

  return 0
}

function getRowTransform(index, drinkId, drag) {
  if (!drag) return undefined

  const isActive = drinkId === drag.id

  if (isActive) {
    const lift = drag.lifted ? ' scale(1.025)' : ''
    return `translateY(${drag.offsetY}px)${lift}`
  }

  const shift = getRowShift(index, drag)
  if (shift === 0) return undefined
  return `translateY(${shift}px)`
}

export default function EditDrinkListPanel({ drinks, onBack, onSave, onReset }) {
  const [draft, setDraft] = useState(() => drinks.map((d) => ({ ...d })))
  const [drag, setDrag] = useState(null)
  const [priceEditId, setPriceEditId] = useState(null)
  const listRef = useRef(null)
  const draftRef = useRef(draft)
  const dragSessionRef = useRef(null)

  draftRef.current = draft

  const toggleHidden = useCallback((index) => {
    setDraft((prev) =>
      prev.map((drink, i) => (i === index ? { ...drink, hidden: !drink.hidden } : drink)),
    )
  }, [])

  const removeDrink = useCallback((index) => {
    setDraft((prev) => {
      if (!prev[index]?.custom) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const updatePrice = useCallback((drinkId, amount) => {
    setDraft((prev) =>
      prev.map((drink) => (drink.id === drinkId ? { ...drink, basePrice: amount } : drink)),
    )
  }, [])

  const finishDrag = useCallback(() => {
    const session = dragSessionRef.current
    if (!session) return

    window.removeEventListener('pointermove', session.onMove)
    window.removeEventListener('pointerup', session.onUp)
    window.removeEventListener('pointercancel', session.onUp)

    if (session.active && session.fromIndex !== session.hoverIndex) {
      setDraft((prev) => reorderItems(prev, session.fromIndex, session.hoverIndex))
    }

    dragSessionRef.current = null
    setDrag(null)
  }, [])

  useEffect(() => () => finishDrag(), [finishDrag])

  const handleReset = () => {
    finishDrag()
    const defaults = onReset()
    setDraft(defaults.map((d) => ({ ...d })))
  }

  const handleDone = () => {
    finishDrag()
    onSave(draft)
  }

  const startDrag = useCallback((e, index, drinkId) => {
    if (dragSessionRef.current) return

    e.preventDefault()

    const row = e.currentTarget.closest('.sipspend-edit-list-row')
    if (!row) return

    const rowHeight = row.getBoundingClientRect().height
    const rowStride = rowHeight + LIST_GAP_PX

    const session = {
      id: drinkId,
      fromIndex: index,
      hoverIndex: index,
      offsetY: 0,
      rowStride,
      startY: e.clientY,
      pointerId: e.pointerId,
      lifted: true,
      active: false,
    }

    session.onMove = (ev) => {
      if (ev.pointerId !== session.pointerId) return

      const offsetY = ev.clientY - session.startY
      const active = session.active || Math.abs(offsetY) >= DRAG_ACTIVATE_PX

      let hoverIndex = session.fromIndex
      if (active) {
        const slots = Math.round(offsetY / session.rowStride)
        const maxIndex = draftRef.current.length - 1
        hoverIndex = Math.max(0, Math.min(maxIndex, session.fromIndex + slots))
      }

      session.offsetY = offsetY
      session.active = active
      session.hoverIndex = hoverIndex

      setDrag({
        id: session.id,
        fromIndex: session.fromIndex,
        hoverIndex: session.hoverIndex,
        offsetY: session.offsetY,
        rowStride: session.rowStride,
        lifted: session.lifted,
        active: session.active,
      })
    }

    session.onUp = (ev) => {
      if (ev.pointerId !== session.pointerId) return
      finishDrag()
    }

    dragSessionRef.current = session
    setDrag({
      id: session.id,
      fromIndex: session.fromIndex,
      hoverIndex: session.hoverIndex,
      offsetY: 0,
      rowStride: session.rowStride,
      lifted: true,
      active: false,
    })

    window.addEventListener('pointermove', session.onMove)
    window.addEventListener('pointerup', session.onUp)
    window.addEventListener('pointercancel', session.onUp)
  }, [finishDrag])

  const editingDrink = priceEditId != null ? draft.find((d) => d.id === priceEditId) : null

  return (
    <>
      <header className="sheet-toolbar sipspend-subview-toolbar">
        <button type="button" className="add-coffee-text-btn" onClick={onBack}>
          Back
        </button>
        <h2 className="sheet-toolbar-title">Edit List</h2>
        <button type="button" className="add-coffee-text-btn add-coffee-text-btn--primary" onClick={handleReset}>
          Reset
        </button>
      </header>

      <div className={`sipspend-subview-body${drag ? ' sipspend-subview-body--dragging' : ''}`}>
        <p className="sipspend-edit-list-hint">
          Drag to reorder, tap a price to edit, or hide drinks you don&apos;t log.
        </p>

        <ul
          ref={listRef}
          className={`sipspend-edit-list${drag ? ' sipspend-edit-list--dragging' : ''}`}
        >
          {draft.map((drink, index) => {
            const isActive = drag?.id === drink.id
            const transform = getRowTransform(index, drink.id, drag)

            return (
              <li
                key={drink.id}
                className={[
                  'sipspend-edit-list-row',
                  drink.hidden ? 'sipspend-edit-list-row--hidden' : '',
                  isActive && drag?.lifted ? 'sipspend-edit-list-row--lifted' : '',
                  isActive && drag?.active ? 'sipspend-edit-list-row--active-drag' : '',
                  drag?.active && !isActive && getRowShift(index, drag) !== 0
                    ? 'sipspend-edit-list-row--shifting'
                    : '',
                ].join(' ')}
                style={transform ? { transform } : undefined}
              >
                <button
                  type="button"
                  className="sipspend-edit-list-drag-handle"
                  aria-label={`Drag to reorder ${drink.name}`}
                  onPointerDown={(e) => startDrag(e, index, drink.id)}
                >
                  <DragHandleIcon />
                </button>

                <div className="sipspend-edit-list-thumb">
                  <CupStickerImage src={drink.sticker} alt="" />
                </div>

                <div className="sipspend-edit-list-copy">
                  <span className="sipspend-edit-list-name">{drink.name}</span>
                </div>

                <button
                  type="button"
                  className="sipspend-edit-list-price-btn"
                  onClick={() => setPriceEditId(drink.id)}
                  aria-label={`Edit price for ${drink.name}, currently ${formatPrice(drink.basePrice)}`}
                >
                  {formatPrice(drink.basePrice)}
                </button>

                <div className="sipspend-edit-list-actions">
                  <button
                    type="button"
                    className="sipspend-edit-list-btn"
                    onClick={() => toggleHidden(index)}
                    aria-label={drink.hidden ? `Show ${drink.name}` : `Hide ${drink.name}`}
                  >
                    <EyeIcon off={drink.hidden} />
                  </button>
                  {drink.custom && (
                    <button
                      type="button"
                      className="sipspend-edit-list-btn sipspend-edit-list-btn--danger"
                      onClick={() => removeDrink(index)}
                      aria-label={`Remove ${drink.name}`}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="sipspend-footer">
        <button type="button" className="sipspend-log-btn" onClick={handleDone}>
          Done
        </button>
      </div>

      {editingDrink &&
        createPortal(
          <AmountKeypadSheet
            title={`${editingDrink.name} price`}
            value={editingDrink.basePrice}
            presets={DRINK_PRICE_PRESETS}
            minAmount={PRICE_RULER.start}
            onConfirm={(amount) => updatePrice(priceEditId, amount)}
            onClose={() => setPriceEditId(null)}
          />,
          document.body,
        )}
    </>
  )
}
