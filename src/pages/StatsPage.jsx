import { useEffect, useMemo, useState } from 'react'
import { subDays, subMonths, startOfYear } from 'date-fns'
import { getAllDrinks } from '../db/database'
import { getDrinkType } from '../data/drinkTypes'
import DrinkSticker from '../components/DrinkSticker'

const PERIODS = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
]

export default function StatsPage({ embedded = false }) {
  const [drinks, setDrinks] = useState([])
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    getAllDrinks().then(setDrinks)
  }, [])

  const filtered = useMemo(() => {
    const now = Date.now()
    if (period === 'week') return drinks.filter((d) => d.timestamp >= subDays(new Date(), 7).getTime())
    if (period === 'month') return drinks.filter((d) => d.timestamp >= subMonths(new Date(), 1).getTime())
    return drinks.filter((d) => d.timestamp >= startOfYear(new Date()).getTime())
  }, [drinks, period])

  const stats = useMemo(() => {
    const totalCups = filtered.length
    const totalCaffeine = filtered.reduce((s, d) => s + (d.caffeine ?? 0), 0)
    const days = period === 'week' ? 7 : period === 'month' ? 30 : Math.max(1, Math.ceil((Date.now() - startOfYear(new Date()).getTime()) / 86400000))
    const avgCaffeine = Math.round(totalCaffeine / days)

    const byType = {}
    for (const d of filtered) {
      byType[d.drinkType] = (byType[d.drinkType] ?? 0) + 1
    }

    const breakdown = Object.entries(byType)
      .map(([id, count]) => ({
        id,
        label: getDrinkType(id)?.label ?? id,
        count,
      }))
      .sort((a, b) => b.count - a.count)

    const maxCount = breakdown[0]?.count ?? 1
    const top = breakdown[0]

    return { totalCups, totalCaffeine, avgCaffeine, breakdown, maxCount, top }
  }, [filtered, period])

  return (
    <>
      {!embedded && (
        <>
          <h1 className="page-title">Statistics</h1>
          <p className="page-subtitle">Your coffee habits at a glance</p>
        </>
      )}

      <div className="segmented">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={period === p.id ? 'active' : ''}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="stat-hero">
        <div className="stat-hero-value">{stats.totalCups}</div>
        <div className="stat-hero-label">cups this {period}</div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-value">{stats.totalCaffeine}</div>
          <div className="stat-card-label">Total mg</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{stats.avgCaffeine}</div>
          <div className="stat-card-label">Avg mg / day</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">
            {stats.top ? <DrinkSticker drinkType={stats.top.id} size="sm" /> : '—'}
          </div>
          <div className="stat-card-label">{stats.top?.label ?? 'Top drink'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{stats.breakdown.length}</div>
          <div className="stat-card-label">Drink types</div>
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Drink breakdown</h2>
        {stats.breakdown.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Log some coffee to see stats
          </p>
        ) : (
          <div className="bar-list">
            {stats.breakdown.map((t) => (
              <div key={t.id} className="bar-item">
                <span className="bar-item-label">
                  <DrinkSticker drinkType={t.id} size="xs" />
                  {t.label}
                </span>
                <div className="bar-item-track">
                  <div
                    className="bar-item-fill"
                    style={{ width: `${(t.count / stats.maxCount) * 100}%` }}
                  />
                </div>
                <span className="bar-item-value">{t.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
