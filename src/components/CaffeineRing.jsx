import { DAILY_CAFFEINE_LIMIT } from '../data/drinkTypes'

export default function CaffeineRing({ total, limit = DAILY_CAFFEINE_LIMIT }) {
  const pct = Math.min(total / limit, 1)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)
  const overLimit = total > limit

  return (
    <div className="caffeine-ring-wrap">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--color-cream-dark)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={overLimit ? 'var(--color-danger)' : 'var(--color-latte)'}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="caffeine-ring-center">
        <span className="caffeine-ring-value">{total}</span>
        <span className="caffeine-ring-unit">mg</span>
      </div>
    </div>
  )
}
