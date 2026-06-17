import { formatPrice } from '../utils/format'
import TallyAmount from './sipspend/TallyAmount'

const SIZE = 220
const STROKE = 14
const RADIUS = 88
const CENTER = SIZE / 2
const ARC_FRACTION = 0.75
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const ARC_LENGTH = CIRCUMFERENCE * ARC_FRACTION

export default function BudgetGauge({
  remaining,
  limit,
  percentRemaining,
  daysLeft,
  budgetState,
}) {
  const isOverspent = budgetState === 'danger'
  const displayAmount = isOverspent ? 0 : remaining
  const fillLength = isOverspent ? 0 : (percentRemaining / 100) * ARC_LENGTH
  const dashOffset = ARC_LENGTH - fillLength

  return (
    <div className="budget-gauge" role="img" aria-label={`${formatPrice(displayAmount)} left to spend, ${percentRemaining}% remaining, ${daysLeft} days left`}>
      <svg className="budget-gauge-svg" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        <circle
          className="budget-gauge-track"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          transform={`rotate(135 ${CENTER} ${CENTER})`}
        />
        <circle
          className={`budget-gauge-fill ${budgetState}`}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(135 ${CENTER} ${CENTER})`}
        />
      </svg>
      <div className="budget-gauge-center">
        <span className="budget-gauge-label">Left to spend</span>
        <span className="budget-gauge-amount">
          <span className="currency">€</span>
          <TallyAmount value={displayAmount} animateOnMount />
        </span>
        <span className="budget-gauge-meta">
          {percentRemaining}% · {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
        </span>
      </div>
    </div>
  )
}
