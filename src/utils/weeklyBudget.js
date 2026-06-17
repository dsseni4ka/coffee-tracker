import { WEEKLY_BUDGET_LIMIT } from '../data/sipSpendDrinks'
import { formatPrice } from './format'

export function getBudgetMetrics(totalSpent, limit) {
  const budgetPercent = Math.min(100, Math.round((totalSpent / limit) * 100))
  const budgetState = budgetPercent >= 100 ? 'danger' : budgetPercent >= 80 ? 'warn' : 'safe'
  const remaining = Math.max(0, limit - totalSpent)
  const overBy = Math.max(0, totalSpent - limit)
  const budgetAlertText =
    budgetState === 'danger'
      ? `${formatPrice(overBy)} over budget`
      : `${formatPrice(remaining)} left to spend`

  return { budgetPercent, budgetState, budgetAlertText, limit, remaining }
}

export function getWeeklyBudgetMetrics(totalSpent, limit = WEEKLY_BUDGET_LIMIT) {
  return getBudgetMetrics(totalSpent, limit)
}
