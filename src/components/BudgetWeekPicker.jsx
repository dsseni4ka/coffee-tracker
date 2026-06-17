import { formatWeekRange } from '../utils/calendarWeek'
import { ChevronLeftIcon, ChevronRightIcon } from './icons/NavIcons'

export default function BudgetWeekPicker({
  selectedWeek,
  isCurrentWeek,
  onPreviousWeek,
  onNextWeek,
}) {
  const rangeLabel = formatWeekRange(selectedWeek)

  return (
    <div className="budget-week-picker">
      <button
        type="button"
        className="budget-week-picker-btn"
        onClick={onPreviousWeek}
        aria-label="Previous week"
      >
        <ChevronLeftIcon size="sm" />
      </button>

      <div className="budget-week-pill">
        {isCurrentWeek && <span className="budget-week-pill-tag">This week</span>}
        <span className="budget-week-pill-label">{rangeLabel}</span>
      </div>

      <button
        type="button"
        className="budget-week-picker-btn"
        onClick={onNextWeek}
        disabled={isCurrentWeek}
        aria-label="Next week"
      >
        <ChevronRightIcon size="sm" />
      </button>
    </div>
  )
}
