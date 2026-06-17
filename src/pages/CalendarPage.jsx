import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  addMonths,
} from 'date-fns'
import { getAllDrinks, toDateKey } from '../db/database'
import { DrinkListItem } from '../components/DrinkForm'
import PageHeader from '../components/PageHeader'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date())
  const [drinksByDate, setDrinksByDate] = useState({})
  const [selected, setSelected] = useState(new Date())

  const load = useCallback(async () => {
    const all = await getAllDrinks()
    const map = {}
    for (const d of all) {
      if (!map[d.dateKey]) map[d.dateKey] = []
      map[d.dateKey].push(d)
    }
    setDrinksByDate(map)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month))
    const end = endOfWeek(endOfMonth(month))
    return eachDayOfInterval({ start, end })
  }, [month])

  const selectedKey = toDateKey(selected)
  const selectedDrinks = drinksByDate[selectedKey] ?? []
  const selectedTotal = selectedDrinks.reduce((s, d) => s + d.caffeine, 0)

  return (
    <>
      <PageHeader
        title="Coffee calendar"
        subtitle="Your brewing history"
      />

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button type="button" className="btn-ghost" onClick={() => setMonth(subMonths(month, 1))}>
            ←
          </button>
          <strong>{format(month, 'MMMM yyyy')}</strong>
          <button type="button" className="btn-ghost" onClick={() => setMonth(addMonths(month, 1))}>
            →
          </button>
        </div>

        <div className="calendar-grid">
          {WEEKDAYS.map((d) => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
          {days.map((day) => {
            const key = toDateKey(day)
            const hasDrinks = (drinksByDate[key]?.length ?? 0) > 0
            const isToday = isSameDay(day, new Date())
            const isSelected = isSameDay(day, selected)
            const inMonth = isSameMonth(day, month)

            return (
              <button
                key={key}
                type="button"
                className={[
                  'calendar-day',
                  !inMonth && 'other-month',
                  isToday && 'today',
                  isSelected && 'selected',
                  hasDrinks && 'has-drinks',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSelected(day)}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h2 style={{ margin: '0 0 8px', fontSize: '1rem' }}>
          {format(selected, 'EEEE, MMM d')}
        </h2>
        <p style={{ margin: '0 0 16px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          {selectedDrinks.length} drink{selectedDrinks.length !== 1 ? 's' : ''} · {selectedTotal} mg
        </p>

        {selectedDrinks.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Nothing logged this day.
          </p>
        ) : (
          <div className="drink-list">
            {selectedDrinks.map((d) => (
              <DrinkListItem key={d.id} drink={d} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
