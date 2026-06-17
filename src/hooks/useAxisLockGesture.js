import { useCallback, useEffect, useRef } from 'react'

const DEFAULT_THRESHOLD = 12
const DEFAULT_SCROLL_SELECTORS = '.sipspend-body, .sipspend-subview-body'

function findScrollParent(fromTarget, selectors) {
  const el = fromTarget?.closest?.(selectors)
  if (el) return el
  return document.querySelector(selectors)
}

function lockScrollPosition(el) {
  const top = el.scrollTop
  const fix = () => {
    el.scrollTop = top
  }
  el.addEventListener('scroll', fix, { passive: true })
  return () => el.removeEventListener('scroll', fix)
}

/**
 * Lets vertical drags scroll the sheet while horizontal drags stay on the
 * nested control. Once horizontal intent is clear, the sheet scroll position
 * is held until the gesture ends.
 */
export function useAxisLockGesture({
  threshold = DEFAULT_THRESHOLD,
  scrollParentSelector = DEFAULT_SCROLL_SELECTORS,
} = {}) {
  const gestureRef = useRef(null)
  const unlockScrollRef = useRef(null)
  const listenersRef = useRef(null)

  const cleanup = useCallback(() => {
    if (!listenersRef.current) return
    const { onMove, onUp } = listenersRef.current
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    listenersRef.current = null
  }, [])

  const endGesture = useCallback(() => {
    cleanup()
    unlockScrollRef.current?.()
    unlockScrollRef.current = null
    gestureRef.current = null
  }, [cleanup])

  const onPointerDown = useCallback(
    (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return

      endGesture()
      gestureRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        axis: null,
        scrollParent: findScrollParent(e.currentTarget, scrollParentSelector),
      }

      const onMove = (ev) => {
        const g = gestureRef.current
        if (!g || ev.pointerId !== g.pointerId) return

        if (!g.axis) {
          const dx = Math.abs(ev.clientX - g.startX)
          const dy = Math.abs(ev.clientY - g.startY)
          if (dx < threshold && dy < threshold) return
          if (dx > dy * 1.15) g.axis = 'x'
          else if (dy > dx * 1.15) g.axis = 'y'
          else return

          if (g.axis === 'x' && g.scrollParent && !unlockScrollRef.current) {
            unlockScrollRef.current = lockScrollPosition(g.scrollParent)
          }
        }
      }

      const onUp = (ev) => {
        if (gestureRef.current?.pointerId !== ev.pointerId) return
        endGesture()
      }

      listenersRef.current = { onMove, onUp }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [endGesture, scrollParentSelector, threshold],
  )

  useEffect(() => () => endGesture(), [endGesture])

  return { onPointerDown }
}
