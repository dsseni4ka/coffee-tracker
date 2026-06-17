import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { DAILY_CAFFEINE_LIMIT } from '../data/drinkTypes'
import { getDrinksForDate, toDateKey } from '../db/database'
import DrinkForm, { DrinkListItem } from '../components/DrinkForm'
import CaffeineRing from '../components/CaffeineRing'
import PageHeader from '../components/PageHeader'
import BrandMark from '../components/BrandMark'
import { useWeatherRecommendation } from '../hooks/useWeather'

export default function HomePage() {
  const [drinks, setDrinks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const todayKey = toDateKey()
  const weather = useWeatherRecommendation()

  const load = useCallback(async () => {
    setDrinks(await getDrinksForDate(todayKey))
  }, [todayKey])

  useEffect(() => {
    load()
  }, [load])

  const totalCaffeine = drinks.reduce((sum, d) => sum + d.caffeine, 0)
  const todayLabel = format(new Date(), 'EEEE, MMM d')

  return (
    <>
      <PageHeader
        hero
        title="Good brew"
        subtitle={todayLabel}
      />

      {weather && (
        <div className="recommendation-banner">
          <div className="recommendation-banner-text">
            <h3>Today&apos;s pick: {weather.drink}</h3>
            <p>{weather.reason}</p>
          </div>
          <div className="recommendation-banner-accent">Drink Well</div>
        </div>
      )}

      <div className="card caffeine-summary" style={{ marginBottom: 24 }}>
        <CaffeineRing total={totalCaffeine} limit={DAILY_CAFFEINE_LIMIT} />
        <div className="caffeine-stats">
          <h2>{drinks.length} drink{drinks.length !== 1 ? 's' : ''} today</h2>
          <p>
            {totalCaffeine} / {DAILY_CAFFEINE_LIMIT} mg daily limit
          </p>
          {totalCaffeine > DAILY_CAFFEINE_LIMIT && (
            <p style={{ color: 'var(--color-danger)', marginTop: 8 }}>
              Over recommended limit
            </p>
          )}
        </div>
      </div>

      {!showForm ? (
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: 24 }}
          onClick={() => setShowForm(true)}
        >
          + Log a drink
        </button>
      ) : (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span className="section-label" style={{ margin: 0 }}>Log drink</span>
            <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
          <DrinkForm
            onSaved={() => {
              setShowForm(false)
              load()
            }}
          />
        </div>
      )}

      <h2 className="section-label">Today&apos;s log</h2>
      {drinks.length === 0 ? (
        <div className="empty-state">
          <BrandMark className="empty-state-mark" />
          <p>No drinks yet — tap above and start your brew diary.</p>
        </div>
      ) : (
        <div className="drink-list">
          {drinks.map((d) => (
            <DrinkListItem key={d.id} drink={d} />
          ))}
        </div>
      )}
    </>
  )
}
