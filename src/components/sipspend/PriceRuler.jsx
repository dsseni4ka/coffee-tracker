import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { PRICE_RULER } from '../../data/sipSpendDrinks'
import { useAxisLockGesture } from '../../hooks/useAxisLockGesture'

const { start: START_PRICE, end: END_PRICE, interval: INTERVAL, stepWidth: STEP_WIDTH } = PRICE_RULER
const TOTAL_STEPS = Math.round((END_PRICE - START_PRICE) / INTERVAL)

function buildRulerTicks() {
  const ticks = []
  for (let i = 0; i <= TOTAL_STEPS; i++) {
    const value = START_PRICE + i * INTERVAL
    const cents = Math.round(value * 100)
    const isMajor = cents % 100 === 0
    const isHalf = cents % 50 === 0 && !isMajor
    ticks.push({ index: i, value, isMajor, isHalf })
  }
  return ticks
}

const RULER_TICKS = buildRulerTicks()

const PriceRuler = forwardRef(function PriceRuler({ price, onPriceChange }, ref) {
  const scrollRef = useRef(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, scrollLeft: 0 })
  const { onPointerDown } = useAxisLockGesture()

  const scrollToPrice = useCallback((targetPrice, smooth = true) => {
    const el = scrollRef.current
    if (!el) return
    const step = Math.round((targetPrice - START_PRICE) / INTERVAL)
    const clamped = Math.max(0, Math.min(TOTAL_STEPS, step))
    if (smooth) el.classList.add('smooth')
    else el.classList.remove('smooth')
    el.scrollTo({ left: clamped * STEP_WIDTH, behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useImperativeHandle(ref, () => ({ scrollToPrice }), [scrollToPrice])

  const readPriceFromScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const step = Math.max(0, Math.min(TOTAL_STEPS, Math.round(el.scrollLeft / STEP_WIDTH)))
    const next = parseFloat((START_PRICE + step * INTERVAL).toFixed(2))
    if (next !== price) onPriceChange(next)
  }, [onPriceChange, price])

  useEffect(() => {
    scrollToPrice(price, false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function snapScroll() {
    const el = scrollRef.current
    if (!el) return
    el.classList.add('smooth')
    const step = Math.round(el.scrollLeft / STEP_WIDTH)
    el.scrollTo({ left: step * STEP_WIDTH, behavior: 'smooth' })
  }

  function onMouseDown(e) {
    isDragging.current = true
    scrollRef.current?.classList.remove('smooth')
    dragStart.current = {
      x: e.pageX - (scrollRef.current?.offsetLeft ?? 0),
      scrollLeft: scrollRef.current?.scrollLeft ?? 0,
    }
  }

  function onMouseMove(e) {
    if (!isDragging.current || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - dragStart.current.x) * 1.5
    scrollRef.current.scrollLeft = dragStart.current.scrollLeft - walk
  }

  function endDrag() {
    if (!isDragging.current) return
    isDragging.current = false
    snapScroll()
  }

  return (
    <div className="sipspend-ruler-wrap" onPointerDown={onPointerDown}>
      <div className="sipspend-ruler-needle" aria-hidden />
      <div
        ref={scrollRef}
        className="sipspend-ruler-scroll smooth"
        onScroll={readPriceFromScroll}
        onMouseDown={onMouseDown}
        onMouseLeave={endDrag}
        onMouseUp={endDrag}
        onMouseMove={onMouseMove}
        onTouchStart={() => scrollRef.current?.classList.remove('smooth')}
        onTouchEnd={snapScroll}
      >
        {RULER_TICKS.map((tick) => (
          <div
            key={tick.index}
            className="sipspend-ruler-tick"
            style={{ width: `${STEP_WIDTH}px` }}
          >
            <div
              className={`tick ${tick.isMajor ? 'major' : tick.isHalf ? 'half' : 'minor'}`}
            />
            {tick.isMajor ? (
              <span className="tick-label">€{Math.round(tick.value)}</span>
            ) : (
              <span className="tick-spacer">.</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

export default PriceRuler
