import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import BudgetTransactionItem from './BudgetTransactionItem'

const DISMISS_THRESHOLD = 36
const VELOCITY_THRESHOLD = 0.35
const TAP_THRESHOLD = 8
const INTERACTIVE_SELECTOR = 'button, a, input, textarea, select, label, [role="button"]'

function isInteractiveTarget(target) {
  return target instanceof Element && target.closest(INTERACTIVE_SELECTOR)
}

export default function BudgetTransactionsSheet({ title, transactions, onClose, onDeleteTransaction }) {
  const [sheetOffset, setSheetOffset] = useState(0)
  const [sheetDragging, setSheetDragging] = useState(false)
  const [editing, setEditing] = useState(false)
  const bodyRef = useRef(null)
  const dragStartY = useRef(0)
  const dragY = useRef(0)
  const dragVelocityY = useRef(0)
  const dragLastMoveY = useRef(0)
  const dragLastMoveTime = useRef(0)
  const draggingRef = useRef(false)
  const dragFromBodyRef = useRef(false)

  useEffect(() => {
    document.body.classList.add('sheet-scroll-locked')
    document.documentElement.classList.add('sheet-scroll-locked')
    return () => {
      document.body.classList.remove('sheet-scroll-locked')
      document.documentElement.classList.remove('sheet-scroll-locked')
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function finishSheetDrag() {
    const moved = dragY.current
    const velocity = dragVelocityY.current
    const fromBody = dragFromBodyRef.current
    dragY.current = 0
    dragVelocityY.current = 0
    dragLastMoveY.current = 0
    dragLastMoveTime.current = 0
    draggingRef.current = false
    dragFromBodyRef.current = false
    setSheetDragging(false)

    const flickedDown = velocity >= VELOCITY_THRESHOLD
    const draggedEnough = moved >= DISMISS_THRESHOLD

    if (draggedEnough || flickedDown || (!fromBody && moved <= TAP_THRESHOLD)) {
      onClose()
      return
    }

    setSheetOffset(0)
  }

  function beginSheetDrag(clientY, fromBody = false) {
    const now = Date.now()
    dragStartY.current = clientY
    dragY.current = 0
    dragVelocityY.current = 0
    dragLastMoveY.current = clientY
    dragLastMoveTime.current = now
    draggingRef.current = true
    dragFromBodyRef.current = fromBody
    setSheetDragging(true)
  }

  function moveSheetDrag(clientY) {
    if (!draggingRef.current) return
    const now = Date.now()
    const dt = now - dragLastMoveTime.current
    if (dt > 0) {
      dragVelocityY.current = (clientY - dragLastMoveY.current) / dt
    }
    dragLastMoveY.current = clientY
    dragLastMoveTime.current = now
    const delta = Math.max(0, clientY - dragStartY.current)
    dragY.current = delta
    setSheetOffset(delta)
  }

  function onDragZonePointerDown(e) {
    beginSheetDrag(e.clientY)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onDragZonePointerMove(e) {
    if (!draggingRef.current) return
    moveSheetDrag(e.clientY)
  }

  function onDragZonePointerUp() {
    if (!draggingRef.current) return
    finishSheetDrag()
  }

  function onBodyPointerDown(e) {
    if (editing || isInteractiveTarget(e.target)) return
    if (bodyRef.current?.scrollTop > 0) return
    beginSheetDrag(e.clientY, true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onBodyPointerMove(e) {
    if (!draggingRef.current || !dragFromBodyRef.current) return
    const delta = e.clientY - dragStartY.current
    if (delta > 0) {
      e.preventDefault()
      moveSheetDrag(e.clientY)
    } else if (delta < 0) {
      draggingRef.current = false
      dragFromBodyRef.current = false
      dragVelocityY.current = 0
      setSheetDragging(false)
      setSheetOffset(0)
    }
  }

  return createPortal(
    <div className="sheet-overlay budget-transactions-overlay" onClick={onClose} role="presentation">
      <div
        className={`sheet budget-transactions-sheet${sheetDragging ? ' budget-transactions-sheet--dragging' : ''}`}
        style={sheetOffset ? { transform: `translateY(${sheetOffset}px)` } : undefined}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <button
          type="button"
          className="budget-transactions-drag-zone"
          aria-label="Close"
          onPointerDown={onDragZonePointerDown}
          onPointerMove={onDragZonePointerMove}
          onPointerUp={onDragZonePointerUp}
          onPointerCancel={onDragZonePointerUp}
        >
          <span className="sheet-handle" aria-hidden />
        </button>

        <header className="sheet-toolbar budget-transactions-toolbar">
          <span className="add-coffee-text-btn add-coffee-text-btn--spacer" aria-hidden />
          <h2 className="sheet-toolbar-title">{title}</h2>
          {transactions.length > 0 && onDeleteTransaction ? (
            <button
              type="button"
              className="add-coffee-text-btn add-coffee-text-btn--primary"
              onClick={() => setEditing((value) => !value)}
            >
              {editing ? 'Done' : 'Edit'}
            </button>
          ) : (
            <span className="add-coffee-text-btn add-coffee-text-btn--spacer" aria-hidden />
          )}
        </header>

        <div
          ref={bodyRef}
          className="budget-transactions-sheet-body"
          onPointerDown={onBodyPointerDown}
          onPointerMove={onBodyPointerMove}
          onPointerUp={onDragZonePointerUp}
          onPointerCancel={onDragZonePointerUp}
        >
          {transactions.length === 0 ? (
            <div className="budget-transactions-empty">No transactions this week.</div>
          ) : (
            <div className="budget-transactions-sheet-list">
              {transactions.map((log) => (
                <BudgetTransactionItem
                  key={log.id}
                  log={log}
                  editing={editing}
                  onDelete={onDeleteTransaction}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
