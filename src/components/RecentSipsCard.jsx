import { useCallback, useEffect, useMemo, useState } from 'react'
import { startOfWeek } from 'date-fns'
import { WEEK_OPTIONS } from '../utils/calendarWeek'
import { getDrinkStickerSrc, SIP_SPEND_DRINKS } from '../data/sipSpendDrinks'
import { formatPrice, formatRelativeTime } from '../utils/format'
import { getDrinksSince } from '../db/database'
import '../styles/sipspend.css'

function formatLogTime(timestamp) {
  return formatRelativeTime(timestamp)
}

function drinkLabel(drink) {
  const match = SIP_SPEND_DRINKS.find((d) => d.drinkType === drink.drinkType)
  return match?.name ?? drink.drinkType
}

export default function RecentSipsCard({ refreshKey = 0 }) {
  const [weekDrinks, setWeekDrinks] = useState([])
  const weekStart = useMemo(() => startOfWeek(new Date(), WEEK_OPTIONS).getTime(), [])

  const load = useCallback(async () => {
    const drinks = await getDrinksSince(weekStart)
    setWeekDrinks(drinks)
  }, [weekStart])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  return (
    <div className="home-card recent-sips-card">
      <div className="sipspend-recent-header">
        <span className="sipspend-recent-title">Recent Sips</span>
      </div>

      <div className="sipspend-logs recent-sips-logs">
        {weekDrinks.length === 0 ? (
          <div className="sipspend-logs-empty">No coffee logged yet this week.</div>
        ) : (
          weekDrinks.slice(0, 3).map((log) => (
            <div key={log.id} className="sipspend-log-item">
              <div className="sipspend-log-left">
                <div className="sipspend-log-icon">
                  <img
                    src={getDrinkStickerSrc(log.drinkType)}
                    alt=""
                    className="sipspend-log-icon-sticker"
                    draggable={false}
                  />
                </div>
                <div>
                  <p className="sipspend-log-name">{drinkLabel(log)}</p>
                  <span className="sipspend-log-meta">
                    {log.placeName || log.cafeName || 'Unknown'} • {formatLogTime(log.timestamp)}
                  </span>
                </div>
              </div>
              <div className="sipspend-log-right">
                <span className="sipspend-log-price">−{formatPrice(log.price ?? 0)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
