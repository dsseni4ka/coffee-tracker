import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { getAllDrinks } from '../db/database'
import { getDrinkType } from '../data/drinkTypes'
import DrinkSticker from '../components/DrinkSticker'
import { getStoredUsername } from '../hooks/useUsername'

const CARD_STYLES = [
  { id: 'cream', label: 'Cream' },
  { id: 'brown', label: 'Brown' },
  { id: 'minimal', label: 'Minimal' },
]

export default function CardsPage({ embedded = false }) {
  const [drinks, setDrinks] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [style, setStyle] = useState('cream')

  useEffect(() => {
    getAllDrinks().then((all) => {
      setDrinks(all)
      if (all.length > 0) setSelectedId(all[0].id)
    })
  }, [])

  const drink = useMemo(
    () => drinks.find((d) => d.id === selectedId) ?? drinks[0],
    [drinks, selectedId]
  )

  const type = drink ? getDrinkType(drink.drinkType) : null

  async function handleShare() {
    if (!drink) return
    const text = `${type?.label} · ${drink.caffeine}mg caffeine · ${format(new Date(drink.timestamp), 'MMM d, yyyy')}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My coffee moment', text })
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    }
  }

  return (
    <>
      {!embedded && (
        <>
          <h1 className="page-title">Coffee cards</h1>
          <p className="page-subtitle">Share your daily coffee moments</p>
        </>
      )}

      {drinks.length === 0 ? (
        <div className="empty-state">
          <DrinkSticker drinkType="latte" size="lg" />
          <p>Log a cup first to create a card</p>
        </div>
      ) : (
        <>
          <div className="card-picker">
            {CARD_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`card-picker-item${style === s.id ? ' active' : ''}`}
                onClick={() => setStyle(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {drink && type && (
            <div className={`share-card share-card--${style}`}>
              <div className="share-card-brand">{getStoredUsername()}</div>
              <div className="share-card-drink">
                <DrinkSticker drinkType={drink.drinkType} size="lg" />
                <h3>{type.label}</h3>
                <p>{format(new Date(drink.timestamp), 'EEEE, MMMM d')}</p>
              </div>
              <div className="share-card-stats">
                <div>
                  <div className="share-card-stat-value">{drink.caffeine}</div>
                  <div className="share-card-stat-label">Caffeine mg</div>
                </div>
                <div>
                  <div className="share-card-stat-value">{format(new Date(drink.timestamp), 'h:mm')}</div>
                  <div className="share-card-stat-label">Time</div>
                </div>
                <div>
                  <div className="share-card-stat-value">1</div>
                  <div className="share-card-stat-label">Cup</div>
                </div>
              </div>
            </div>
          )}

          <div className="card-picker" style={{ marginBottom: 16 }}>
            {drinks.slice(0, 8).map((d) => (
              <button
                key={d.id}
                type="button"
                className={`card-picker-item${selectedId === d.id ? ' active' : ''}`}
                onClick={() => setSelectedId(d.id)}
              >
                <DrinkSticker drinkType={d.drinkType} size="xs" />
                {format(new Date(d.timestamp), 'MMM d')}
              </button>
            ))}
          </div>

          <button type="button" className="btn btn-primary btn-block" onClick={handleShare}>
            Share card
          </button>
        </>
      )}
    </>
  )
}
