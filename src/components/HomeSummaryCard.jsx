import WeeklyBudgetCard from './WeeklyBudgetCard'
import DaySummaryCard from './DaySummaryCard'
import { toDateKey } from '../db/database'

export default function HomeSummaryCard({
  dayFocused,
  selectedDate,
  selectedDayDrinks,
  weekTotalSpent,
  weekCollageTypes,
  weeklyLimit,
  weeklyCollageRef,
  dayCollageRef,
  landingDrink,
  onLandingRevealDone,
  onBackToWeek,
}) {
  const panelKey = dayFocused ? toDateKey(selectedDate) : 'week'

  return (
    <div className="home-summary-card-shell">
      <div key={panelKey} className="home-summary-card-panel">
        {dayFocused ? (
          <DaySummaryCard
            date={selectedDate}
            drinks={selectedDayDrinks}
            collageRef={dayCollageRef}
            onBackToWeek={onBackToWeek}
          />
        ) : (
          <WeeklyBudgetCard
            totalSpent={weekTotalSpent}
            collageTypes={weekCollageTypes}
            limit={weeklyLimit}
            collageRef={weeklyCollageRef}
            landingDrink={landingDrink}
            onLandingRevealDone={onLandingRevealDone}
          />
        )}
      </div>
    </div>
  )
}
