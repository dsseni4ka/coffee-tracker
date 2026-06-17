import { format } from 'date-fns'
import { getDrinkType } from '../data/drinkTypes'
import { SIP_SPEND_DRINKS } from '../data/sipSpendDrinks'
import { formatPrice } from '../utils/format'

function drinkLabel(drink) {
  const match = SIP_SPEND_DRINKS.find((d) => d.drinkType === drink.drinkType)
  return match?.name ?? getDrinkType(drink.drinkType)?.label ?? drink.drinkType
}

export default function BudgetTransactionItem({ log }) {
  return (
    <div className="sipspend-log-item budget-transaction-item">
      <div className="sipspend-log-left">
        <div className="sipspend-log-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3"
            />
          </svg>
        </div>
        <div>
          <p className="sipspend-log-name">{drinkLabel(log)}</p>
          <span className="sipspend-log-meta">
            {log.placeName || log.cafeName || 'Unknown'} • {format(new Date(log.timestamp), 'MMM d')}
          </span>
        </div>
      </div>
      <span className="sipspend-log-price">+{formatPrice(log.price ?? 0)}</span>
    </div>
  )
}
