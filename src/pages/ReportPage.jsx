import { useEffect, useMemo, useState } from 'react'
import { format, subDays, startOfDay } from 'date-fns'
import { getAllDrinks, toDateKey } from '../db/database'
import { getDrinkType } from '../data/drinkTypes'

import PageHeader from '../components/PageHeader'

export default function ReportPage() {
  const [drinks, setDrinks] = useState([])

  useEffect(() => {
    getAllDrinks().then(setDrinks)
  }, [])

  const weekStart = startOfDay(subDays(new Date(), 6))
  const weekDrinks = drinks.filter((d) => d.timestamp >= weekStart.getTime())

  const stats = useMemo(() => {
    const totalCaffeine = weekDrinks.reduce((s, d) => s + d.caffeine, 0)
    const avgPerDay = totalCaffeine / 7

    const byType = {}
    for (const d of weekDrinks) {
      byType[d.drinkType] = (byType[d.drinkType] ?? 0) + 1
    }

    const typeBreakdown = Object.entries(byType)
      .map(([id, count]) => ({
        id,
        label: getDrinkType(id)?.label ?? id,
        emoji: getDrinkType(id)?.emoji ?? '☕',
        count,
      }))
      .sort((a, b) => b.count - a.count)

    const maxCount = typeBreakdown[0]?.count ?? 1

    const byDay = {}
    for (let i = 0; i < 7; i++) {
      const day = subDays(new Date(), 6 - i)
      byDay[toDateKey(day)] = 0
    }
    for (const d of weekDrinks) {
      if (byDay[d.dateKey] != null) byDay[d.dateKey] += d.caffeine
    }

    const dailyCaffeine = Object.entries(byDay).map(([key, mg]) => ({
      key,
      label: format(new Date(key), 'EEE'),
      mg,
    }))

    const maxDayMg = Math.max(...dailyCaffeine.map((d) => d.mg), 1)

    return { totalCaffeine, avgPerDay, typeBreakdown, maxCount, dailyCaffeine, maxDayMg }
  }, [weekDrinks])

  return (
    <>
      <PageHeader
        title="Coffee report"
        subtitle="Last 7 days"
      />

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-value">{weekDrinks.length}</div>
          <div className="stat-label">Total drinks</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{stats.totalCaffeine}</div>
          <div className="stat-label">mg caffeine</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{Math.round(stats.avgPerDay)}</div>
          <div className="stat-label">mg / day avg</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">
            {stats.typeBreakdown[0]?.emoji ?? '—'}
          </div>
          <div className="stat-label">
            Top: {stats.typeBreakdown[0]?.label ?? 'None'}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '1rem' }}>Caffeine by day</h2>
        <div className="bar-chart">
          {stats.dailyCaffeine.map((d) => (
            <div key={d.key} className="bar-row">
              <span className="bar-label">{d.label}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(d.mg / stats.maxDayMg) * 100}%` }}
                />
              </div>
              <span className="bar-value">{d.mg}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{ margin: '0 0 16px', fontSize: '1rem' }}>Drink breakdown</h2>
        {stats.typeBreakdown.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No data yet.</p>
        ) : (
          <div className="bar-chart">
            {stats.typeBreakdown.map((t) => (
              <div key={t.id} className="bar-row">
                <span className="bar-label">{t.emoji} {t.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(t.count / stats.maxCount) * 100}%` }}
                  />
                </div>
                <span className="bar-value">{t.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
