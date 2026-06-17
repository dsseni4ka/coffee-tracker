import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatAmount } from '../utils/format'
import { getDrinkStickerSrc } from '../data/sipSpendDrinks'
import { getDrinkType } from '../data/drinkTypes'
import { getWeeklyBudgetMetrics } from '../utils/weeklyBudget'
import '../styles/sipspend.css'

const STICKER_SLOTS = [
  { left: 0, rotate: -6, y: -50 },
  { left: 26, rotate: 4, y: -52 },
  { left: 52, rotate: -3, y: -48 },
  { left: 78, rotate: 5, y: -54 },
  { left: 104, rotate: -2, y: -50 },
]

function slotStyle(index) {
  const slot = STICKER_SLOTS[index] ?? STICKER_SLOTS[4]
  return {
    left: `${slot.left}px`,
    zIndex: index + 1,
    transform: `translateY(${slot.y}%) rotate(${slot.rotate}deg)`,
  }
}

export default function WeeklyBudgetCard({
  totalSpent,
  collageTypes = [],
  limit,
  collageRef,
  landingDrink = null,
  onLandingRevealDone,
}) {
  const { budgetPercent, budgetState, budgetAlertText } = getWeeklyBudgetMetrics(totalSpent, limit)
  const visibleTypes = collageTypes.slice(0, 5)
  const prevTypesRef = useRef(visibleTypes)
  const [revealReady, setRevealReady] = useState(false)
  const [enteringTypes, setEnteringTypes] = useState(() => new Set())

  const landingDrinkType = landingDrink?.type ?? null
  const landingIsNew = landingDrink?.isNew ?? false

  useLayoutEffect(() => {
    const prev = new Set(prevTypesRef.current)
    const added = visibleTypes.filter((typeId) => !prev.has(typeId))

    if (!landingDrinkType && added.length > 0) {
      setEnteringTypes((current) => {
        const next = new Set(current)
        added.forEach((typeId) => next.add(typeId))
        return next
      })
    }

    prevTypesRef.current = visibleTypes
  }, [visibleTypes, landingDrinkType])

  useEffect(() => {
    if (!landingDrinkType) {
      setRevealReady(false)
      return undefined
    }

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setRevealReady(true))
    })

    return () => cancelAnimationFrame(frame)
  }, [landingDrinkType])

  useEffect(() => {
    if (!landingDrinkType || !revealReady) return undefined

    const timer = setTimeout(() => {
      onLandingRevealDone?.()
    }, 540)

    return () => clearTimeout(timer)
  }, [landingDrinkType, revealReady, onLandingRevealDone])

  useEffect(() => {
    if (enteringTypes.size === 0) return undefined

    const timer = setTimeout(() => {
      setEnteringTypes(new Set())
    }, 560)

    return () => clearTimeout(timer)
  }, [enteringTypes])

  const isEmpty = visibleTypes.length === 0

  return (
    <div className="home-card week-summary-card">
      <div className="week-budget-header">
        <div>
          <span>Weekly Spent</span>
          <div className="sipspend-spent">
            <span className="currency">€</span>
            <span className="amount">{formatAmount(totalSpent)}</span>
          </div>
        </div>
        <div
          ref={collageRef}
          className={`month-sticker-collage${isEmpty ? ' month-sticker-collage--empty' : ''}`}
          aria-hidden
        >
          {visibleTypes.map((typeId, index) => {
            const label = getDrinkType(typeId)?.label ?? typeId
            const layout = slotStyle(index)
            const isLanding = landingDrinkType === typeId
            const isPending = isLanding && landingIsNew && !revealReady
            const isEntering =
              (isLanding && landingIsNew && revealReady) || (!isLanding && enteringTypes.has(typeId))

            return (
              <img
                key={typeId}
                data-collage-type={typeId}
                src={getDrinkStickerSrc(typeId)}
                alt=""
                className={[
                  'collage-sticker',
                  isPending && 'collage-sticker--pending',
                  isEntering && 'collage-sticker--enter',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  ...layout,
                  '--collage-enter-to': layout.transform,
                }}
                title={label}
                draggable={false}
              />
            )
          })}
        </div>
      </div>
      <div className="sipspend-progress-track">
        <div
          className={`sipspend-progress-fill ${budgetState}`}
          style={{ width: `${budgetPercent}%` }}
        />
      </div>
      <div className="sipspend-budget-footer">
        <span className={`sipspend-budget-alert ${budgetState}`}>{budgetAlertText}</span>
        <span className="sipspend-percent">{budgetPercent}% used</span>
      </div>
    </div>
  )
}
