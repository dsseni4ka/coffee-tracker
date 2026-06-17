import { formatDistanceToNow } from 'date-fns'
import { getDrinkType } from '../data/drinkTypes'
import { getDrinkStickerSrc, SIP_SPEND_DRINKS } from '../data/sipSpendDrinks'
import { formatPrice } from '../utils/format'

function formatLogTime(timestamp) {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return 'Just now'
  return formatDistanceToNow(timestamp, { addSuffix: true })
}

function drinkLabel(drink) {
  const match = SIP_SPEND_DRINKS.find((d) => d.drinkType === drink.drinkType)
  return match?.name ?? getDrinkType(drink.drinkType)?.label ?? drink.drinkType
}

export default function BudgetTransactionItem({ log }) {
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
      </div>
    </div>
  )
}
