import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatDistanceToNow, startOfWeek } from 'date-fns'
import { SIP_SPEND_DRINKS } from '../data/sipSpendDrinks'
import { formatPrice } from '../utils/format'
import { deleteDrink, deleteDrinks, getDrinksSince } from '../db/database'
import '../styles/sipspend.css'

function formatLogTime(timestamp) {
  const diff = Date.now() - timestamp
  if (diff < 60_000) return 'Just now'
  return formatDistanceToNow(timestamp, { addSuffix: true })
}

function drinkLabel(drink) {
  const match = SIP_SPEND_DRINKS.find((d) => d.drinkType === drink.drinkType)
  return match?.name ?? drink.drinkType
}

export default function RecentSipsCard({ refreshKey = 0, onChanged }) {
  const [weekDrinks, setWeekDrinks] = useState([])
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 0 }).getTime(), [])

  const load = useCallback(async () => {
    const drinks = await getDrinksSince(weekStart)
    setWeekDrinks(drinks)
  }, [weekStart])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  async function removeLog(id) {
    await deleteDrink(id)
    await load()
    onChanged?.()
  }

  async function clearAll() {
    if (weekDrinks.length === 0) return
    await deleteDrinks(weekDrinks.map((d) => d.id))
    await load()
    onChanged?.()
  }

  return (
    <div className="home-card recent-sips-card">
      <div className="sipspend-recent-header">
        <span className="sipspend-recent-title">Recent Sips</span>
        {weekDrinks.length > 0 && (
          <button type="button" className="sipspend-clear-btn" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      <div className="sipspend-logs recent-sips-logs">
        {weekDrinks.length === 0 ? (
          <div className="sipspend-logs-empty">No coffee logged yet this week.</div>
        ) : (
          weekDrinks.slice(0, 5).map((log) => (
            <div key={log.id} className="sipspend-log-item">
              <div className="sipspend-log-left">
                <div className="sipspend-log-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3"
                    />
                  </svg>
                </div>
                <div>
                  <p className="sipspend-log-name">{drinkLabel(log)}</p>
                  <span className="sipspend-log-meta">
                    {log.placeName || log.cafeName || 'Unknown'} • {formatLogTime(log.timestamp)}
                  </span>
                </div>
              </div>
              <div className="sipspend-log-right">
                <span className="sipspend-log-price">+{formatPrice(log.price ?? 0)}</span>
                <button
                  type="button"
                  className="sipspend-log-remove"
                  onClick={() => removeLog(log.id)}
                  aria-label="Remove log"
                >
                  <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
