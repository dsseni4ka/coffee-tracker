import { getDrinkType } from '../data/drinkTypes'

function getCafeLabel(drink) {
  if (drink.homemade) return 'Homemade'
  if (drink.cafeName?.trim()) return drink.cafeName.trim()

  if (drink.placeName?.trim()) {
    const parts = drink.placeName.split('·').map((s) => s.trim())
    const last = parts[parts.length - 1]
    if (last && !/^(café|cafe|home|office|outdoors|other)$/i.test(last)) return last
    if (parts.length > 1) return parts[parts.length - 1]
    return drink.placeName.replace(/^[\p{Emoji}\s]+/u, '').trim() || drink.placeName
  }

  return null
}

export function computeFavoriteCafes(drinks) {
  const byCafe = {}

  for (const drink of drinks) {
    const name = getCafeLabel(drink)
    if (!name) continue

    if (!byCafe[name]) {
      byCafe[name] = { name, cups: 0, drinkCounts: {}, latestLocatedDrink: null }
    }

    byCafe[name].cups += 1
    byCafe[name].drinkCounts[drink.drinkType] =
      (byCafe[name].drinkCounts[drink.drinkType] ?? 0) + 1

    if (drink.lat != null && drink.lng != null) {
      const ts = drink.loggedAt ?? drink.timestamp ?? 0
      const prev = byCafe[name].latestLocatedDrink
      const prevTs = prev ? (prev.loggedAt ?? prev.timestamp ?? 0) : 0
      if (!prev || ts >= prevTs) {
        byCafe[name].latestLocatedDrink = drink
      }
    }
  }

  return Object.values(byCafe)
    .map((cafe) => {
      const topEntry = Object.entries(cafe.drinkCounts).sort((a, b) => b[1] - a[1])[0]
      const topDrinkId = topEntry?.[0] ?? 'latte'
      const located = cafe.latestLocatedDrink
      return {
        name: cafe.name,
        cups: cafe.cups,
        topDrinkId,
        topDrink: getDrinkType(topDrinkId),
        lat: located?.lat ?? null,
        lng: located?.lng ?? null,
      }
    })
    .sort((a, b) => b.cups - a.cups)
}
