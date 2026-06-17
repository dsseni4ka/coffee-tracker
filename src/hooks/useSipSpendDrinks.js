import { useCallback, useState } from 'react'
import { SIP_SPEND_DRINKS } from '../data/sipSpendDrinks'

const STORAGE_KEY = 'coffee-tracker-sipspend-drinks'

function loadDrinks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore */
  }
  return SIP_SPEND_DRINKS.map((drink) => ({ ...drink }))
}

function persistDrinks(drinks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drinks))
}

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24)
}

export function useSipSpendDrinks() {
  const [drinks, setDrinksState] = useState(loadDrinks)

  const setDrinks = useCallback((next) => {
    setDrinksState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      persistDrinks(resolved)
      return resolved
    })
  }, [])

  const visibleDrinks = drinks.filter((d) => !d.hidden)

  const addCustomDrink = useCallback(({ name, basePrice, sticker }) => {
    const trimmed = name.trim()
    const slug = slugify(trimmed) || 'drink'
    const id = `custom-${slug}-${Date.now()}`
    const drink = {
      id,
      name: trimmed,
      basePrice,
      drinkType: id,
      sticker,
      custom: true,
    }
    setDrinks((prev) => [...prev, drink])
    return drink
  }, [setDrinks])

  const updateDrinkList = useCallback((nextDrinks) => {
    setDrinks(nextDrinks)
  }, [setDrinks])

  const resetDrinkList = useCallback(() => {
    const defaults = SIP_SPEND_DRINKS.map((drink) => ({ ...drink }))
    setDrinks(defaults)
    return defaults
  }, [setDrinks])

  return {
    drinks,
    visibleDrinks,
    addCustomDrink,
    updateDrinkList,
    resetDrinkList,
  }
}
