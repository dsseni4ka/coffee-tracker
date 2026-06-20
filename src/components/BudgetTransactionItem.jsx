import { getDrinkType } from '../data/drinkTypes'
import { getDrinkStickerSrc, SIP_SPEND_DRINKS } from '../data/sipSpendDrinks'
import { formatPrice, formatRelativeTime } from '../utils/format'

function formatLogTime(timestamp) {
  return formatRelativeTime(timestamp)
}

function drinkLabel(drink) {
  const match = SIP_SPEND_DRINKS.find((d) => d.drinkType === drink.drinkType)
  return match?.name ?? getDrinkType(drink.drinkType)?.label ?? drink.drinkType
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  )
}

export default function BudgetTransactionItem({ log, editing = false, onDelete }) {
  return (
    <div className="sipspend-log-item">
      <div className="sipspend-log-left">
        <div className="sipspend-log-icon">
          <img
            src={getDrinkStickerSrc(log.drinkType)}
            alt=""
            className="sipspend-log-icon-sticker"
            draggable={false}
          />
        </div>
        <div>
          <p className="sipspend-log-name">{drinkLabel(log)}</p>
          <span className="sipspend-log-meta">
            {log.placeName || log.cafeName || 'Unknown'} • {formatLogTime(log.timestamp)}
          </span>
        </div>
      </div>
      <div className="sipspend-log-right">
        <span className="sipspend-log-price">−{formatPrice(log.price ?? 0)}</span>
        {editing && onDelete && (
          <button
            type="button"
            className="sipspend-log-remove"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(log.id)
            }}
            aria-label={`Delete ${drinkLabel(log)}`}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  )
}
