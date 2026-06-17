export const DRINK_TYPES = [
  { id: 'espresso', label: 'Espresso', emoji: '☕', caffeine: 63, category: 'coffee', stickerBg: '#EDE4D8' },
  { id: 'double-espresso', label: 'Double Espresso', emoji: '☕', caffeine: 126, category: 'coffee', stickerBg: '#E8DDD0' },
  { id: 'americano', label: 'Americano', emoji: '🫗', caffeine: 94, category: 'coffee', stickerBg: '#E5DFD6' },
  { id: 'latte', label: 'Latte', emoji: '🥛', caffeine: 75, category: 'coffee', stickerBg: '#F0E8DC' },
  { id: 'cappuccino', label: 'Cappuccino', emoji: '☁️', caffeine: 75, category: 'coffee', stickerBg: '#EBE3D9' },
  { id: 'flat-white', label: 'Flat White', emoji: '🤍', caffeine: 130, category: 'coffee', stickerBg: '#E7E0D8' },
  { id: 'cold-brew', label: 'Cold Brew', emoji: '🧊', caffeine: 200, category: 'coffee', stickerBg: '#DCE8EE' },
  { id: 'drip', label: 'Drip Coffee', emoji: '💧', caffeine: 95, category: 'coffee', stickerBg: '#E6DDD2' },
  { id: 'matcha', label: 'Matcha', emoji: '🍵', caffeine: 70, category: 'matcha', stickerBg: '#E0EBE0' },
  { id: 'matcha-latte', label: 'Matcha Latte', emoji: '🍵', caffeine: 55, category: 'matcha', stickerBg: '#E4EDE4' },
]

export const DAILY_CAFFEINE_LIMIT = 400

export function getDrinkType(id) {
  return DRINK_TYPES.find((d) => d.id === id)
}

export function getCaffeineForDrink(drinkId, sizeMultiplier = 1) {
  const drink = getDrinkType(drinkId)
  return drink ? Math.round(drink.caffeine * sizeMultiplier) : 0
}

export function getDrinkEmoji(drinkId) {
  return getDrinkType(drinkId)?.emoji ?? '☕'
}
