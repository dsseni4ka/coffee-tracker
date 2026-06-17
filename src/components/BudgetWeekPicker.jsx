import { formatWeekRange } from '../utils/calendarWeek'
import { getBudgetStatusLabel } from '../utils/weeklyBudget'
import { ChevronLeftIcon, ChevronRightIcon } from './icons/NavIcons'

export default function BudgetWeekPicker({
  selectedWeek,
  isCurrentWeek,
  budgetState = 'safe',
  onPreviousWeek,
  onNextWeek,
}) {
  const rangeLabel = formatWeekRange(selectedWeek)
  const statusLabel = getBudgetStatusLabel(budgetState)

  return (
    <div className="calendar-month-nav">
      <button
        type="button"
        className="calendar-month-nav-btn"
        onClick={onPreviousWeek}
        aria-label="Previous week"
      >
        <ChevronLeftIcon size="sm" />
      </button>

      <div className="calendar-month-label">
        <h1>{rangeLabel}</h1>
        <p className={`budget-week-status budget-week-status--${budgetState}`}>{statusLabel}</p>
      </div>

      <button
        type="button"
        className="calendar-month-nav-btn"
        onClick={onNextWeek}
        disabled={isCurrentWeek}
        aria-label="Next week"
      >
        <ChevronRightIcon size="sm" />
      </button>
    </div>
  )
}
