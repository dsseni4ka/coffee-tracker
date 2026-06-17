import DrinkSticker from './DrinkSticker'
import { formatAmount } from '../utils/format'
import { getWeeklyBudgetMetrics } from '../utils/weeklyBudget'
import '../styles/sipspend.css'

export default function WeeklyBudgetCard({ totalSpent, collageTypes = [] }) {
  const { budgetPercent, budgetState, budgetAlertText } = getWeeklyBudgetMetrics(totalSpent)

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
        {collageTypes.length > 0 && (
          <div className="month-sticker-collage" aria-hidden>
            {collageTypes.slice(0, 5).map((typeId, i) => (
              <DrinkSticker
                key={typeId}
                drinkType={typeId}
                size="collage"
                cutout
                emoji
                className={`collage-sticker collage-sticker--${i}`}
              />
            ))}
          </div>
        )}
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
