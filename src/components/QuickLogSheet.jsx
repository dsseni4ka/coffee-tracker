import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'
import {
  MOCK_LOCATIONS,
  PRICE_RULER,
  SIP_SPEND_DRINKS,
} from '../data/sipSpendDrinks'
import { addDrink, getAllDrinks } from '../db/database'
import { computeFavoriteCafes } from '../utils/favoriteCafes'
import { formatAmount, formatPrice } from '../utils/format'
import CafeSearchInput from './CafeSearchInput'
import { PinIcon } from './icons/NavIcons'
import { CoffeeCupIcon } from './sipspend/CoffeeCupSvgs'
import SizeSlider from './sipspend/SizeSlider'
import '../styles/sipspend.css'

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
    <div className="sipspend-ruler-wrap">
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

function Toast({ message, visible }) {
  return (
    <div className={`sipspend-toast${visible ? ' visible' : ''}`} role="status" aria-live="polite">
      <span className="sipspend-toast-check">
        <svg fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span>{message}</span>
    </div>
  )
}

export default function QuickLogSheet({ onClose, onSaved }) {
  const [selectedIndex, setSelectedIndex] = useState(1)
  const [price, setPrice] = useState(SIP_SPEND_DRINKS[1].basePrice)
  const [sizeLabel, setSizeLabel] = useState('medium')
  const [useCurrentLocation, setUseCurrentLocation] = useState(true)
  const [cafeName, setCafeName] = useState('')
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [quickLocations, setQuickLocations] = useState([])
  const [searchCenter, setSearchCenter] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', visible: false })
  const toastTimer = useRef(null)
  const carouselRef = useRef(null)
  const rulerRef = useRef(null)

  const selected = SIP_SPEND_DRINKS[selectedIndex]

  useEffect(() => {
    getAllDrinks().then((drinks) => {
      const favorites = computeFavoriteCafes(drinks).slice(0, 4)
      if (favorites.length > 0) {
        setQuickLocations(
          favorites.map((c) => ({ name: c.name, lat: c.lat, lng: c.lng })),
        )
        return
      }
      setQuickLocations(MOCK_LOCATIONS.slice(0, 4).map((name) => ({ name, lat: null, lng: null })))
    })
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setSearchCenter(coords)
        if (useCurrentLocation) {
          setLat(coords.lat)
          setLng(coords.lng)
        }
      },
      () => {},
      { timeout: 8000, enableHighAccuracy: true },
    )
  }, [useCurrentLocation])

  useEffect(() => {
    if (useCurrentLocation) {
      setCafeName('')
      if (searchCenter) {
        setLat(searchCenter.lat)
        setLng(searchCenter.lng)
      }
    }
  }, [useCurrentLocation, searchCenter])

  const placeSearchCenter = lat != null && lng != null ? { lat, lng } : searchCenter

  function showToast(message) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, visible: true })
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }))
    }, 2200)
  }

  function selectCoffee(index) {
    const drink = SIP_SPEND_DRINKS[index]
    setSelectedIndex(index)
    setPrice(drink.basePrice)
    rulerRef.current?.scrollToPrice(drink.basePrice)
    carouselRef.current?.children[index]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }

  function adjustPrice(delta) {
    const next = parseFloat(Math.max(START_PRICE, Math.min(END_PRICE, price + delta)).toFixed(2))
    setPrice(next)
    rulerRef.current?.scrollToPrice(next)
  }

  function selectQuickLocation(loc) {
    setUseCurrentLocation(false)
    setCafeName(loc.name)
    setLat(loc.lat ?? null)
    setLng(loc.lng ?? null)
  }

  async function logCurrentCoffee() {
    setSaving(true)
    await addDrink({
      drinkType: selected.drinkType,
      sizeLabel,
      price,
      cafeName: cafeName.trim(),
      placeName: useCurrentLocation
        ? 'Current location'
        : cafeName.trim() || 'Unknown location',
      venueId: 'cafe',
      caffeineKnown: true,
      lat,
      lng,
      loggedAt: new Date(),
    })
    setSaving(false)
    onSaved?.()
    showToast(`Logged ${selected.name} for ${formatPrice(price)}!`)
    onClose?.()
  }

  const isLocationSelected = (name) => cafeName.trim() === name

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} role="presentation">
        <div
          className="sheet sipspend-sheet"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="SipSpend"
        >
          <div className="sipspend-sheet-handle" aria-hidden />

          <div className="sipspend-body">
            <header className="sipspend-header">
              <div className="sipspend-header-left">
                <button type="button" className="sipspend-close" onClick={onClose}>
                  Cancel
                </button>
                <div className="sipspend-header-copy">
                  <span>Today&apos;s Sip</span>
                  <h1>SipSpend</h1>
                </div>
              </div>
            </header>

            <section className="sipspend-section">
              <div className="sipspend-section-label">
                <h2>1. Tap a Cup</h2>
                <span className="sipspend-carousel-indicator">{selected.name} Selected</span>
              </div>

              <div ref={carouselRef} className="sipspend-carousel">
                {SIP_SPEND_DRINKS.map((drink, index) => (
                  <button
                    key={drink.id}
                    type="button"
                    className={`sipspend-coffee-card${selectedIndex === index ? ' cup-active' : ''}`}
                    onClick={() => selectCoffee(index)}
                  >
                    <div className="sipspend-cup-wrap">
                      <CoffeeCupIcon index={index} />
                    </div>
                    <h3>{drink.name}</h3>
                    <span className="sipspend-coffee-price">{formatPrice(drink.basePrice)}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="sipspend-section">
              <div className="sipspend-section-label">
                <span>2. Dial Budget Cost</span>
                <span className="sipspend-dial-hint">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  Drag Ruler Dial
                </span>
              </div>

              <div className="sipspend-price-box">
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
                    <span className="amount">{formatAmount(price)}</span>
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
            </section>

            <section className="sipspend-section">
              <div className="sipspend-section-label">
                <span>3. Pick Size</span>
                <span className="sipspend-carousel-indicator">Slide to resize</span>
              </div>
              <SizeSlider value={sizeLabel} onChange={setSizeLabel} />
            </section>

            <section className="sipspend-section">
              <div className="sipspend-section-label">
                <span>4. Where?</span>
                {!useCurrentLocation && cafeName.trim() && (
                  <span className="sipspend-carousel-indicator">{cafeName.trim()}</span>
                )}
              </div>

              <div className="sipspend-location-box">
                {quickLocations.length > 0 && !useCurrentLocation && (
                  <div className="sipspend-location-chips" role="list">
                    {quickLocations.map((loc) => (
                      <button
                        key={loc.name}
                        type="button"
                        role="listitem"
                        className={`sipspend-location-chip${isLocationSelected(loc.name) ? ' active' : ''}`}
                        onClick={() => selectQuickLocation(loc)}
                      >
                        <span className="sipspend-location-chip-dot" aria-hidden />
                        {loc.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="sipspend-location-search">
                  {useCurrentLocation ? (
                    <div className="cafe-search cafe-search--selected">
                      <button
                        type="button"
                        className="add-coffee-row-card add-coffee-location-input sipspend-current-location"
                        onClick={() => setUseCurrentLocation(false)}
                      >
                        <span className="add-coffee-row-icon"><PinIcon size="sm" /></span>
                        <span className="sipspend-current-location-label">Use current location</span>
                        <span className="cafe-search-check" aria-hidden>✓</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <CafeSearchInput
                        value={cafeName}
                        onChange={setCafeName}
                        center={placeSearchCenter}
                        onSelectPlace={(place) => {
                          if (place) {
                            setLat(place.lat)
                            setLng(place.lng)
                          } else {
                            setLat(null)
                            setLng(null)
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="sipspend-use-current-link"
                        onClick={() => setUseCurrentLocation(true)}
                      >
                        Use current location
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="sipspend-footer">
            <button
              type="button"
              className="sipspend-log-btn"
              onClick={logCurrentCoffee}
              disabled={saving}
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>
                {saving ? 'Logging…' : `Log ${selected.name} (${formatPrice(price)})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  )
}
