import { useMemo, useState } from 'react'
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
import { toDateKey } from '../db/database'
import DrinkSticker from './DrinkSticker'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function ProfileCalendar({ drinksByDate }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState(new Date())
  const today = new Date()

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month))
    const end = endOfWeek(endOfMonth(month))
    return eachDayOfInterval({ start, end })
  }, [month])

  const selectedDrinks = drinksByDate[toDateKey(selected)] ?? []

  return (
    <div className="profile-calendar">
      <div className="profile-calendar-nav">
        <button
          type="button"
          className="profile-calendar-nav-btn"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="profile-calendar-month">{format(month, 'MMMM yyyy')}</span>
        <button
          type="button"
          className="profile-calendar-nav-btn"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="profile-calendar-grid">
        {WEEKDAYS.map((d, i) => (
          <div key={`${d}-${i}`} className="profile-calendar-weekday">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = toDateKey(day)
          const dayDrinks = drinksByDate[key] ?? []
          const hasDrink = dayDrinks.length > 0
          const isToday = isSameDay(day, today)
          const isSelected = isSameDay(day, selected)
          const inMonth = isSameMonth(day, month)

          return (
            <button
              key={key}
              type="button"
              className={[
                'profile-calendar-day',
                !inMonth && 'other-month',
                hasDrink && 'has-drink',
                isToday && 'today',
                isSelected && 'selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setSelected(day)}
            >
              {!hasDrink && <span className="profile-calendar-day-num">{format(day, 'd')}</span>}
              {hasDrink && (
                <DrinkSticker
                  drinkType={dayDrinks[0].drinkType}
                  size="cell"
                  cutout
                  emoji
                  className="profile-calendar-sticker"
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="profile-calendar-day-detail">
        <p className="profile-calendar-day-label">{format(selected, 'EEE, MMM d')}</p>
        {selectedDrinks.length === 0 ? (
          <p className="profile-calendar-day-empty">No coffee logged this day</p>
        ) : (
          <ul className="profile-calendar-day-list">
            {selectedDrinks.map((drink) => {
              const type = getDrinkType(drink.drinkType)
              return (
                <li key={drink.id} className="profile-calendar-day-item">
                  <DrinkSticker drinkType={drink.drinkType} size="sm" cutout emoji />
                  <div>
                    <strong>{type?.label ?? 'Coffee'}</strong>
                    <span>{format(new Date(drink.timestamp), 'HH:mm')}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
