import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import BudgetTransactionItem from './BudgetTransactionItem'

const DISMISS_THRESHOLD = 36
const VELOCITY_THRESHOLD = 0.35
const TAP_THRESHOLD = 8

export default function BudgetTransactionsSheet({ title, transactions, onClose }) {
  const [sheetOffset, setSheetOffset] = useState(0)
  const [sheetDragging, setSheetDragging] = useState(false)
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
          <header className="sheet-toolbar budget-transactions-toolbar">
            <h2 className="sheet-toolbar-title">{title}</h2>
          </header>
        </button>

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
                <BudgetTransactionItem key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
