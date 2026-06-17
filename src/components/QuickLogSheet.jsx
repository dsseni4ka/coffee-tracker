import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MOCK_LOCATIONS,
  PRICE_RULER,
} from '../data/sipSpendDrinks'
import { useSipSpendDrinks } from '../hooks/useSipSpendDrinks'
import { addDrink, getAllDrinks } from '../db/database'
import { computeFavoriteCafes } from '../utils/favoriteCafes'
import { formatAmount, formatPrice } from '../utils/format'
import { reverseGeocode } from '../utils/placeSearch'
import CafeSearchInput from './CafeSearchInput'
import { PinIcon } from './icons/NavIcons'
import { CupStickerImage, StarSticker } from './sipspend/CoffeeCupSvgs'
import CustomDrinkPanel from './sipspend/CustomDrinkPanel'
import EditDrinkListPanel from './sipspend/EditDrinkListPanel'
import SizeSlider from './sipspend/SizeSlider'
import TallyAmount from './sipspend/TallyAmount'
import PriceRuler from './sipspend/PriceRuler'
import { animateDrinkToCollage, wait } from '../utils/drinkFlyAnimation'
import '../styles/sipspend.css'

const { start: START_PRICE, end: END_PRICE } = PRICE_RULER

const CAROUSEL_GAP = 16
const CAROUSEL_CENTER_SCALE = 1.3
const CAROUSEL_EDGE_SCALE = 0.78
const CAROUSEL_SCROLL_END_MS = 120
const CAROUSEL_SETTLE_DELAY_MS = 500

function getCarouselScrollBounds(carousel) {
  const cards = carousel.querySelectorAll('.sipspend-coffee-card')
  if (!cards.length) {
    return { min: 0, max: Math.max(0, carousel.scrollWidth - carousel.clientWidth) }
  }

  const first = cards[0]
  const last = cards[cards.length - 1]
  const halfViewport = carousel.clientWidth / 2
  const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth)

  const min = Math.max(0, first.offsetLeft + first.offsetWidth / 2 - halfViewport)
  const max = Math.min(maxScroll, last.offsetLeft + last.offsetWidth / 2 - halfViewport)

  return { min, max: Math.max(min, max) }
}

function clampCarouselScroll(carousel) {
  const { min, max } = getCarouselScrollBounds(carousel)
  if (carousel.scrollLeft < min) carousel.scrollLeft = min
  else if (carousel.scrollLeft > max) carousel.scrollLeft = max
}

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

export default function QuickLogSheet({
  onClose,
  onSaved,
  onDrinkLanding,
  flyTargetRef,
  loggedAt = new Date(),
}) {
  const { drinks, visibleDrinks, addCustomDrink, updateDrinkList, resetDrinkList } = useSipSpendDrinks()
  const [sheetView, setSheetView] = useState('log')
  const [selectedIndex, setSelectedIndex] = useState(1)
  const [price, setPrice] = useState(() => visibleDrinks[1]?.basePrice ?? 4.5)
  const [sizeLabel, setSizeLabel] = useState('medium')
  const [useCurrentLocation, setUseCurrentLocation] = useState(true)
  const [cafeName, setCafeName] = useState('')
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [quickLocations, setQuickLocations] = useState([])
  const [searchCenter, setSearchCenter] = useState(null)
  const [currentLocationPlace, setCurrentLocationPlace] = useState(null)
  const [currentLocationLoading, setCurrentLocationLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', visible: false })
  const [sheetOffset, setSheetOffset] = useState(0)
  const [sheetDragging, setSheetDragging] = useState(false)
  const [sheetEntered, setSheetEntered] = useState(false)
  const [logging, setLogging] = useState(false)
  const toastTimer = useRef(null)
  const carouselRef = useRef(null)
  const carouselSettleTimer = useRef(null)
  const carouselScrollEndTimer = useRef(null)
  const closestIndexRef = useRef(selectedIndex)
  const selectedIndexRef = useRef(selectedIndex)
  const rulerRef = useRef(null)
  const sheetDragStartY = useRef(0)
  const sheetDragY = useRef(0)
  const sheetDraggingRef = useRef(false)
  const pendingSelectId = useRef(null)

  const selected = visibleDrinks[selectedIndex] ?? visibleDrinks[0]

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setSheetEntered(true)
      return undefined
    }

    const frame = requestAnimationFrame(() => setSheetEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const main = document.querySelector('.app-main')
    main?.classList.add('app-main--scroll-locked')
    document.body.classList.add('sheet-scroll-locked')

    return () => {
      main?.classList.remove('app-main--scroll-locked')
      document.body.classList.remove('sheet-scroll-locked')
    }
  }, [])

  useEffect(() => {
    selectedIndexRef.current = selectedIndex
    closestIndexRef.current = selectedIndex
  }, [selectedIndex])

  useEffect(() => {
    if (selectedIndex >= visibleDrinks.length) {
      const nextIndex = Math.max(0, visibleDrinks.length - 1)
      setSelectedIndex(nextIndex)
      if (visibleDrinks[nextIndex]) {
        setPrice(visibleDrinks[nextIndex].basePrice)
      }
    }
  }, [visibleDrinks, selectedIndex])

  useEffect(() => {
    if (!pendingSelectId.current) return
    const idx = visibleDrinks.findIndex((d) => d.id === pendingSelectId.current)
    if (idx >= 0) {
      pendingSelectId.current = null
      selectCoffee(idx)
    }
  }, [visibleDrinks]) // eslint-disable-line react-hooks/exhaustive-deps

  const commitCarouselSelection = useCallback((index) => {
    if (index < 0 || index >= visibleDrinks.length) return
    if (index === selectedIndexRef.current) return

    selectedIndexRef.current = index
    closestIndexRef.current = index
    const drink = visibleDrinks[index]
    setSelectedIndex(index)
    setPrice(drink.basePrice)
    rulerRef.current?.scrollToPrice(drink.basePrice)
  }, [visibleDrinks])

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

  useEffect(() => {
    if (!useCurrentLocation) {
      setCurrentLocationPlace(null)
      setCurrentLocationLoading(false)
      return
    }

    const coords = lat != null && lng != null ? { lat, lng } : searchCenter
    if (!coords) {
      setCurrentLocationPlace(null)
      setCurrentLocationLoading(true)
      return
    }

    let cancelled = false
    setCurrentLocationLoading(true)

    reverseGeocode(coords.lat, coords.lng).then((place) => {
      if (cancelled) return
      setCurrentLocationPlace(place)
      setCurrentLocationLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [useCurrentLocation, lat, lng, searchCenter])

  const updateCarouselMotion = useCallback(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const carouselRect = carousel.getBoundingClientRect()
    const centerX = carouselRect.left + carouselRect.width / 2
    const viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2
    let closestIndex = 0
    let closestDist = Infinity

    Array.from(carousel.querySelectorAll('.sipspend-coffee-card')).forEach((card, index) => {
      const cardWidth = card.offsetWidth
      const cardCenter = card.offsetLeft + cardWidth / 2
      const dist = Math.abs(cardCenter - viewportCenter)
      if (dist < closestDist) {
        closestDist = dist
        closestIndex = index
      }
      const step = cardWidth + CAROUSEL_GAP
      const t = Math.min(1, dist / step)
      const scale = CAROUSEL_EDGE_SCALE + (1 - t) * (CAROUSEL_CENTER_SCALE - CAROUSEL_EDGE_SCALE)

      const cardRect = card.getBoundingClientRect()
      const cardCenterX = cardRect.left + cardRect.width / 2
      const offset = (cardCenterX - centerX) / (carouselRect.width * 0.5)
      const clamped = Math.max(-1.15, Math.min(1.15, offset))
      const rotate = clamped * 4.5
      const translateY = Math.abs(clamped) * 6
      const wrap = card.querySelector('.sipspend-cup-wrap')

      card.style.setProperty('--card-scale', scale.toFixed(3))
      card.style.transform = `scale(${scale.toFixed(3)})`
      card.style.zIndex = String(Math.round(scale * 10))

      if (wrap) {
        wrap.style.setProperty('--scroll-rotate', `${rotate.toFixed(2)}deg`)
        wrap.style.setProperty('--scroll-y', `${translateY.toFixed(2)}px`)
      }
    })

    closestIndexRef.current = closestIndex
  }, [])

  const clearCarouselSettleAnimation = useCallback(() => {
    clearTimeout(carouselSettleTimer.current)
    carouselRef.current?.querySelectorAll('.sipspend-cup-wrap').forEach((wrap) => {
      wrap.classList.remove('cup-scroll-settle')
    })
  }, [])

  const playCarouselSettleAnimation = useCallback(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    carousel.querySelectorAll('.sipspend-cup-wrap').forEach((wrap) => {
      wrap.classList.remove('cup-scroll-settle')
    })

    const carouselRect = carousel.getBoundingClientRect()
    const centerX = carouselRect.left + carouselRect.width / 2
    let closestWrap = null
    let closestDist = Infinity

    Array.from(carousel.querySelectorAll('.sipspend-coffee-card')).forEach((card) => {
      const cardRect = card.getBoundingClientRect()
      const dist = Math.abs(cardRect.left + cardRect.width / 2 - centerX)
      if (dist < closestDist) {
        closestDist = dist
        closestWrap = card.querySelector('.sipspend-cup-wrap')
      }
    })

    closestWrap?.classList.add('cup-scroll-settle')
  }, [])

  const scheduleCarouselSettleAnimation = useCallback(() => {
    clearTimeout(carouselSettleTimer.current)
    carouselSettleTimer.current = setTimeout(playCarouselSettleAnimation, CAROUSEL_SETTLE_DELAY_MS)
  }, [playCarouselSettleAnimation])

  const finishCarouselScroll = useCallback(() => {
    const carousel = carouselRef.current
    if (carousel) clampCarouselScroll(carousel)
    carousel?.classList.remove('sipspend-carousel--scrolling')
    commitCarouselSelection(closestIndexRef.current)
    scheduleCarouselSettleAnimation()
  }, [commitCarouselSelection, scheduleCarouselSettleAnimation])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    function onCarouselScroll() {
      clampCarouselScroll(carousel)
      carousel.classList.add('sipspend-carousel--scrolling')
      clearCarouselSettleAnimation()
      clearTimeout(carouselScrollEndTimer.current)
      updateCarouselMotion()
      carouselScrollEndTimer.current = setTimeout(finishCarouselScroll, CAROUSEL_SCROLL_END_MS)
    }

    function onCarouselScrollEnd() {
      clampCarouselScroll(carousel)
      updateCarouselMotion()
    }

    function onResize() {
      clampCarouselScroll(carousel)
      updateCarouselMotion()
    }

    carousel.addEventListener('scroll', onCarouselScroll, { passive: true })
    carousel.addEventListener('scrollend', onCarouselScrollEnd)
    window.addEventListener('resize', onResize)
    carousel.querySelectorAll('.sipspend-coffee-card')[selectedIndex]?.scrollIntoView({
      inline: 'center',
      block: 'nearest',
    })
    clampCarouselScroll(carousel)
    updateCarouselMotion()

    return () => {
      carousel.removeEventListener('scroll', onCarouselScroll)
      carousel.removeEventListener('scrollend', onCarouselScrollEnd)
      window.removeEventListener('resize', onResize)
      clearTimeout(carouselScrollEndTimer.current)
      clearCarouselSettleAnimation()
    }
  }, [updateCarouselMotion, clearCarouselSettleAnimation, finishCarouselScroll, visibleDrinks.length, selectedIndex])

  const placeSearchCenter = lat != null && lng != null ? { lat, lng } : searchCenter
  const currentLocationLabel = currentLocationLoading
    ? 'Finding your location…'
    : currentLocationPlace?.name || 'Current location'
  const currentLocationSubtitle = currentLocationPlace?.subtitle || ''

  function showToast(message) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, visible: true })
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }))
    }, 2200)
  }

  function selectCoffee(index) {
    const drink = visibleDrinks[index]
    if (!drink) return
    closestIndexRef.current = index
    selectedIndexRef.current = index
    setSelectedIndex(index)
    setPrice(drink.basePrice)
    rulerRef.current?.scrollToPrice(drink.basePrice)
    clearTimeout(carouselScrollEndTimer.current)
    clearCarouselSettleAnimation()
    carouselRef.current?.classList.remove('sipspend-carousel--scrolling')
    carouselRef.current?.querySelectorAll('.sipspend-coffee-card')[index]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
    updateCarouselMotion()
    carouselScrollEndTimer.current = setTimeout(finishCarouselScroll, CAROUSEL_SCROLL_END_MS)
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
    if (saving || !selected) return
    setSaving(true)

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const targetEl = flyTargetRef?.current
    const activeCard = carouselRef.current?.querySelector('.sipspend-coffee-card.cup-active')
    const cupImage = activeCard?.querySelector('.sipspend-drink-sticker')
    const canAnimate = !prefersReduced && targetEl && cupImage

    const drinkPromise = addDrink({
      drinkType: selected.drinkType,
      sizeLabel,
      price,
      cafeName: cafeName.trim(),
      placeName: useCurrentLocation
        ? currentLocationPlace?.name || 'Current location'
        : cafeName.trim() || 'Unknown location',
      venueId: 'cafe',
      caffeineKnown: true,
      lat,
      lng,
      loggedAt,
    })

    if (canAnimate) {
      setLogging(true)
      await wait(260)
      const fromRect = cupImage.getBoundingClientRect()
      setSheetEntered(false)
      await wait(300)
      await animateDrinkToCollage({
        fromRect,
        stickerSrc: selected.sticker,
        targetEl,
        onApproach: () => onDrinkLanding?.(selected.drinkType),
      })
      await drinkPromise
      setSaving(false)
      onClose?.()
      return
    }

    await drinkPromise
    setSaving(false)
    onSaved?.()
    showToast(`Logged ${selected.name} for ${formatPrice(price)}!`)
    onClose?.()
  }

  const isLocationSelected = (name) => cafeName.trim() === name

  function finishSheetDrag() {
    const moved = sheetDragY.current
    sheetDragY.current = 0
    sheetDraggingRef.current = false
    setSheetDragging(false)
    if (moved > 72 || moved <= 8) {
      onClose?.()
      return
    }
    setSheetOffset(0)
  }

  function onSheetHandlePointerDown(e) {
    sheetDragStartY.current = e.clientY
    sheetDragY.current = 0
    sheetDraggingRef.current = true
    setSheetDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onSheetHandlePointerMove(e) {
    if (!sheetDraggingRef.current) return
    const delta = Math.max(0, e.clientY - sheetDragStartY.current)
    sheetDragY.current = delta
    setSheetOffset(delta)
  }

  function onSheetHandlePointerUp() {
    if (!sheetDraggingRef.current) return
    finishSheetDrag()
  }

  function onSheetHandlePointerCancel() {
    if (!sheetDraggingRef.current) return
    finishSheetDrag()
  }

  function handleCustomDrinkSave(payload) {
    const drink = addCustomDrink(payload)
    pendingSelectId.current = drink.id
    setSheetView('log')
  }

  function handleEditListSave(nextDrinks) {
    updateDrinkList(nextDrinks)
    setSheetView('log')
  }

  const sheetAriaLabel =
    sheetView === 'custom' ? 'Add custom drink' : sheetView === 'edit-list' ? 'Edit drink list' : 'Log coffee'

  return (
    <>
      <div
        className={`sheet-overlay sipspend-sheet-overlay${sheetEntered ? ' sipspend-sheet-overlay--visible' : ''}${logging ? ' sipspend-sheet-overlay--logging' : ''}`}
        onClick={onClose}
        role="presentation"
      >
        <div
          className={`sheet sipspend-sheet${sheetEntered ? ' sipspend-sheet--visible' : ''}${sheetDragging ? ' sipspend-sheet--dragging' : ''}${logging ? ' sipspend-sheet--logging' : ''}`}
          style={sheetOffset ? { transform: `translateY(${sheetOffset}px)` } : undefined}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label={sheetAriaLabel}
        >
          <button
            type="button"
            className="sipspend-sheet-handle-zone"
            aria-label="Close"
            onPointerDown={onSheetHandlePointerDown}
            onPointerMove={onSheetHandlePointerMove}
            onPointerUp={onSheetHandlePointerUp}
            onPointerCancel={onSheetHandlePointerCancel}
          >
            <span className="sipspend-sheet-handle" aria-hidden />
          </button>

          {sheetView === 'custom' ? (
            <CustomDrinkPanel
              onBack={() => setSheetView('log')}
              onSave={handleCustomDrinkSave}
            />
          ) : sheetView === 'edit-list' ? (
            <EditDrinkListPanel
              drinks={drinks}
              onBack={() => setSheetView('log')}
              onSave={handleEditListSave}
              onReset={resetDrinkList}
            />
          ) : (
            <>
          <div className="sipspend-body">
            <section className="sipspend-section">
              <div className="sipspend-section-label">
                <h2>1. Tap a Cup</h2>
                <span className="sipspend-carousel-indicator">{selected.name} Selected</span>
              </div>

              <div ref={carouselRef} className="sipspend-carousel">
                <button
                  type="button"
                  className="sipspend-carousel-action sipspend-carousel-action--add"
                  onClick={() => setSheetView('custom')}
                  aria-label="Add custom drink"
                >
                  <span className="sipspend-carousel-action-icon" aria-hidden>+</span>
                  <span className="sipspend-carousel-action-label">Custom</span>
                </button>

                {visibleDrinks.map((drink, index) => (
                  <button
                    key={drink.id}
                    type="button"
                    data-drink={drink.id}
                    className={`sipspend-coffee-card${selectedIndex === index ? ' cup-active' : ''}`}
                    onClick={() => selectCoffee(index)}
                  >
                    <div className="sipspend-cup-wrap">
                      <CupStickerImage src={drink.sticker} alt={drink.name} />
                      {drink.id === 'latte' && <StarSticker />}
                    </div>
                    <div className="sipspend-coffee-meta">
                      <h3>{drink.name}</h3>
                      <span className="sipspend-coffee-price">{formatPrice(drink.basePrice)}</span>
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  className="sipspend-carousel-action sipspend-carousel-action--edit"
                  onClick={() => setSheetView('edit-list')}
                  aria-label="Edit drink list"
                >
                  <span className="sipspend-carousel-action-icon" aria-hidden>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h10" />
                    </svg>
                  </span>
                  <span className="sipspend-carousel-action-label">Edit List</span>
                </button>
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
            </section>

            <section className="sipspend-section">
              <div className="sipspend-section-label">
                <span>3. Pick Size</span>
                <span className="sipspend-carousel-indicator">Slide to resize</span>
              </div>
              <SizeSlider
                value={sizeLabel}
                onChange={setSizeLabel}
                drinkSticker={selected.sticker}
              />
            </section>

            <section className="sipspend-section">
              <div className="sipspend-section-label">
                <span>4. Where?</span>
                {useCurrentLocation ? (
                  <span className="sipspend-carousel-indicator">{currentLocationLabel}</span>
                ) : (
                  cafeName.trim() && (
                    <span className="sipspend-carousel-indicator">{cafeName.trim()}</span>
                  )
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
                        <span className="sipspend-current-location-copy">
                          <span className="sipspend-current-location-label">{currentLocationLabel}</span>
                          {currentLocationSubtitle && (
                            <span className="sipspend-current-location-sub">{currentLocationSubtitle}</span>
                          )}
                        </span>
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
              disabled={saving || !selected}
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>
                {saving ? 'Logging…' : `Log ${selected?.name ?? 'Drink'} (${formatPrice(price)})`}
              </span>
            </button>
          </div>
            </>
          )}
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  )
}
