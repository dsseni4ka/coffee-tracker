import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { getAllDrinks, toDateKey } from '../db/database'
import { getDrinkStickerSrc } from '../data/sipSpendDrinks'
import { useBudget } from '../hooks/useBudget'
import { WEEK_OPTIONS, WEEKDAY_LABELS } from '../utils/calendarWeek'
import QuickLogSheet from '../components/QuickLogSheet'
import WeeklyBudgetCard from '../components/WeeklyBudgetCard'
import RecentSipsCard from '../components/RecentSipsCard'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons/NavIcons'

const WEEKDAYS = WEEKDAY_LABELS

export default function CalendarHomePage() {
  const { weeklyLimit } = useBudget()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [drinksByDate, setDrinksByDate] = useState({})
  const [selected, setSelected] = useState(new Date())
  const [showLog, setShowLog] = useState(false)
  const [sipRefresh, setSipRefresh] = useState(0)
  const [landingDrink, setLandingDrink] = useState(null)
  const touchStartX = useRef(null)
  const weeklyCollageRef = useRef(null)

  const load = useCallback(async () => {
    const all = await getAllDrinks()
    const map = {}
    for (const d of all) {
      if (!map[d.dateKey]) map[d.dateKey] = []
      map[d.dateKey].push(d)
    }
    setDrinksByDate(map)
    setSipRefresh((k) => k + 1)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), WEEK_OPTIONS)
    const end = endOfWeek(endOfMonth(month), WEEK_OPTIONS)
    return eachDayOfInterval({ start, end })
  }, [month])

  const today = new Date()

  const weekStats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), WEEK_OPTIONS).getTime()
    let totalSpent = 0
    const typeCounts = {}

    for (const drinks of Object.values(drinksByDate)) {
      for (const drink of drinks) {
        if (drink.timestamp < weekStart) continue
        totalSpent += drink.price ?? 0
        typeCounts[drink.drinkType] = (typeCounts[drink.drinkType] ?? 0) + 1
      }
    }

    const collageTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)

    return { totalSpent, collageTypes }
  }, [drinksByDate])

  const handleDrinkLanding = useCallback((drinkType) => {
    const isNew = !weekStats.collageTypes.slice(0, 5).includes(drinkType)
    if (isNew) {
      setLandingDrink({ type: drinkType, isNew: true })
    }
    load()
  }, [weekStats.collageTypes, load])

  const monthCups = useMemo(() => {
    const monthPrefix = format(month, 'yyyy-MM')
    let cups = 0
    for (const [key, drinks] of Object.entries(drinksByDate)) {
      if (!key.startsWith(monthPrefix)) continue
      cups += drinks.length
    }
    return cups
  }, [drinksByDate, month])

  const viewingCurrentMonth = isSameMonth(month, today)

  function goToPrevMonth() {
    setMonth((m) => subMonths(m, 1))
  }

  function goToNextMonth() {
    setMonth((m) => addMonths(m, 1))
  }

  function goToToday() {
    setMonth(startOfMonth(today))
    setSelected(today)
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (dx > 56) setMonth((m) => subMonths(m, 1))
    if (dx < -56) setMonth((m) => addMonths(m, 1))
  }

  return (
    <div className="calendar-home">
      <header className="calendar-hero">
        <div className="calendar-month-nav">
          <button
            type="button"
            className="calendar-month-nav-btn"
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeftIcon size="sm" />
          </button>

          <div className="calendar-month-label">
            <h1>{format(month, 'MMMM yyyy')}</h1>
            <p>{format(selected, 'EEE, MMM d, yyyy')}</p>
          </div>

          <button
            type="button"
            className="calendar-month-nav-btn"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRightIcon size="sm" />
          </button>
        </div>

        {!viewingCurrentMonth && (
          <button type="button" className="calendar-today-btn" onClick={goToToday}>
            Today
          </button>
        )}
      </header>

      <div
        className="calendar-panel"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="calendar-grid">
          {WEEKDAYS.map((d) => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
          {days.map((day) => {
            const key = toDateKey(day)
            const dayDrinks = drinksByDate[key] ?? []
            const hasDrink = dayDrinks.length > 0
            const isToday = isSameDay(day, today)
            const isSelected = isSameDay(day, selected)
            const inMonth = isSameMonth(day, month)
            const primaryDrink = dayDrinks[0]

            return (
              <button
                key={key}
                type="button"
                className={[
                  'calendar-day',
                  !inMonth && 'other-month',
                  hasDrink && 'has-drink',
                  isToday && 'today',
                  isSelected && 'selected',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  setSelected(day)
                  if (!isSameMonth(day, month)) {
                    setMonth(startOfMonth(day))
                  }
                }}
              >
                {!hasDrink && (
                  <span className="calendar-day-num">{format(day, 'd')}</span>
                )}
                {hasDrink && (
                  <>
                    <img
                      src={getDrinkStickerSrc(primaryDrink.drinkType)}
                      alt=""
                      className="calendar-day-sticker"
                      draggable={false}
                    />
                    {dayDrinks.length > 1 && (
                      <span className="calendar-day-badge">{dayDrinks.length}</span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <button type="button" className="add-cup-btn" onClick={() => setShowLog(true)}>
        Add a new cup
      </button>

      <WeeklyBudgetCard
        totalSpent={weekStats.totalSpent}
        collageTypes={weekStats.collageTypes}
        limit={weeklyLimit}
        collageRef={weeklyCollageRef}
        landingDrink={landingDrink}
        onLandingRevealDone={() => setLandingDrink(null)}
      />

      <RecentSipsCard refreshKey={sipRefresh} onChanged={load} />

      <div className="home-card monthly-cups-card">
        <span className="home-card-label">
          {viewingCurrentMonth ? 'This Month' : format(month, 'MMMM yyyy')}
        </span>
        <div className="monthly-cups-stat">
          <span className="monthly-cups-value">{monthCups}</span>
          <span className="monthly-cups-label">{monthCups === 1 ? 'cup' : 'cups'}</span>
        </div>
      </div>

      {showLog && (
        <QuickLogSheet
          flyTargetRef={weeklyCollageRef}
          onClose={() => setShowLog(false)}
          onSaved={load}
          onDrinkLanding={handleDrinkLanding}
        />
      )}
    </div>
  )
}
