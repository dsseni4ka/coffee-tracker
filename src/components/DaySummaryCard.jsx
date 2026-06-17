import { format, isSameDay } from 'date-fns'
import { formatAmount, formatPrice } from '../utils/format'
import { getDrinkStickerSrc, SIP_SPEND_DRINKS } from '../data/sipSpendDrinks'
import { getDrinkType } from '../data/drinkTypes'
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

function drinkLabel(drink) {
  const match = SIP_SPEND_DRINKS.find((d) => d.drinkType === drink.drinkType)
  return match?.name ?? getDrinkType(drink.drinkType)?.label ?? drink.drinkType
}

export default function DaySummaryCard({ date, drinks = [], collageRef, onBackToWeek }) {
  const today = new Date()
  const isToday = isSameDay(date, today)
  const totalSpent = drinks.reduce((sum, drink) => sum + (drink.price ?? 0), 0)
  const cupCount = drinks.length
  const collageTypes = drinks.slice(0, 5).map((drink) => drink.drinkType)
  const isEmpty = collageTypes.length === 0

  return (
    <div className="home-card week-summary-card day-summary-card">
      <div className="week-budget-header">
        <div>
          <span className="week-budget-eyebrow">{isToday ? 'Today' : format(date, 'EEEE')}</span>
          <div className="day-summary-date">{format(date, 'MMM d, yyyy')}</div>
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
          {collageTypes.map((typeId, index) => {
            const label = getDrinkType(typeId)?.label ?? typeId
            const layout = slotStyle(index)

            return (
              <img
                key={`${typeId}-${index}`}
                data-collage-type={typeId}
                src={getDrinkStickerSrc(typeId)}
                alt=""
                className="collage-sticker"
                style={layout}
                title={label}
                draggable={false}
              />
            )
          })}
        </div>
      </div>

      {cupCount === 0 ? (
        <p className="day-summary-empty">No cups logged this day</p>
      ) : (
        <>
          <div className="day-summary-meta">
            <span>{cupCount === 1 ? '1 cup' : `${cupCount} cups`}</span>
            <span>{formatPrice(totalSpent)} spent</span>
          </div>
          <ul className="day-summary-drinks">
            {drinks.map((drink) => (
              <li key={drink.id} className="day-summary-drink">
                <span className="day-summary-drink-name">{drinkLabel(drink)}</span>
                <span className="day-summary-drink-time">
                  {format(new Date(drink.timestamp), 'HH:mm')}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <button type="button" className="day-summary-back" onClick={onBackToWeek}>
        View weekly summary
      </button>
    </div>
  )
}
