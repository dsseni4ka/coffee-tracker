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
import { getDrinkType } from '../data/drinkTypes'
import { getAllDrinks, toDateKey } from '../db/database'
import DrinkSticker from '../components/DrinkSticker'
import QuickLogSheet from '../components/QuickLogSheet'
import WeeklyBudgetCard from '../components/WeeklyBudgetCard'
import RecentSipsCard from '../components/RecentSipsCard'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarHomePage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [drinksByDate, setDrinksByDate] = useState({})
  const [selected, setSelected] = useState(new Date())
  const [showLog, setShowLog] = useState(false)
  const [sipRefresh, setSipRefresh] = useState(0)
  const touchStartX = useRef(null)

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
    const start = startOfWeek(startOfMonth(month))
    const end = endOfWeek(endOfMonth(month))
    return eachDayOfInterval({ start, end })
  }, [month])

  const today = new Date()
  const monthPrefix = format(month, 'yyyy-MM')

  const weekStats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }).getTime()
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

  const monthStats = useMemo(() => {
    let cups = 0
    const shops = new Set()
    const typeCounts = {}

    for (const [key, drinks] of Object.entries(drinksByDate)) {
      if (!key.startsWith(monthPrefix)) continue
      cups += drinks.length
      for (const drink of drinks) {
        typeCounts[drink.drinkType] = (typeCounts[drink.drinkType] ?? 0) + 1
        if (drink.placeName?.trim()) shops.add(drink.placeName.trim())
      }
    }

    const collageTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)

    const favoriteId = collageTypes[0] ?? null

    return {
      cups,
      shops: shops.size,
      collageTypes,
      favoriteId,
      favorite: favoriteId ? getDrinkType(favoriteId) : null,
    }
  }, [drinksByDate, monthPrefix])

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
        <h1>Today</h1>
        <p>{format(today, 'EEE, MMM d, yyyy')}</p>
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
                onClick={() => setSelected(day)}
              >
                {!hasDrink && (
                  <span className="calendar-day-num">{format(day, 'd')}</span>
                )}
                {hasDrink && (
                  <>
                    <DrinkSticker
                      drinkType={primaryDrink.drinkType}
                      size="cell"
                      cutout
                      emoji
                      className="calendar-day-sticker"
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
      />

      <RecentSipsCard refreshKey={sipRefresh} onChanged={load} />

      <div className="home-card monthly-favorite-card">
        <div className="monthly-favorite-row">
          <span className="home-card-label monthly-favorite-label">Monthly Favorite</span>
          {monthStats.favorite ? (
            <DrinkSticker drinkType={monthStats.favorite.id} size="lg" cutout emoji />
          ) : (
            <DrinkSticker drinkType="latte" size="lg" cutout emoji />
          )}
        </div>
      </div>

      {showLog && (
        <QuickLogSheet
          onClose={() => setShowLog(false)}
          onSaved={load}
        />
      )}
    </div>
  )
}
