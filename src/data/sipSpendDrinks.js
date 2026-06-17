export const SIP_SPEND_DRINKS = [
  { id: 'espresso', name: 'Espresso', basePrice: 3.25, drinkType: 'espresso', sticker: '/drink-stickers/americano.png' },
  { id: 'cappuccino', name: 'Cappuccino', basePrice: 4.5, drinkType: 'cappuccino', sticker: '/drink-stickers/cappuccino.png' },
  { id: 'latte', name: 'Latte', basePrice: 4.85, drinkType: 'latte', sticker: '/drink-stickers/latte.png' },
  { id: 'flat-white', name: 'Flat White', basePrice: 4.75, drinkType: 'flat-white', sticker: '/drink-stickers/flat-white.png' },
  { id: 'cold-brew', name: 'Cold Brew', basePrice: 5.2, drinkType: 'cold-brew', sticker: '/drink-stickers/cold-brew.png' },
  { id: 'iced-latte', name: 'Iced Latte', basePrice: 5.0, drinkType: 'iced-latte', sticker: '/drink-stickers/iced-latte.png' },
  { id: 'iced-cappuccino', name: 'Iced Cappuccino', basePrice: 5.0, drinkType: 'iced-cappuccino', sticker: '/drink-stickers/iced-cappuccino.png' },
  { id: 'matcha', name: 'Matcha', basePrice: 5.5, drinkType: 'matcha', sticker: '/drink-stickers/matcha.png' },
  { id: 'iced-matcha', name: 'Iced Matcha', basePrice: 5.75, drinkType: 'iced-matcha', sticker: '/drink-stickers/iced-matcha.png' },
]

export const DRINK_STICKER_OPTIONS = [
  { id: 'americano', label: 'Espresso', src: '/drink-stickers/americano.png' },
  { id: 'cappuccino', label: 'Cappuccino', src: '/drink-stickers/cappuccino.png' },
  { id: 'latte', label: 'Latte', src: '/drink-stickers/latte.png' },
  { id: 'flat-white', label: 'Flat White', src: '/drink-stickers/flat-white.png' },
  { id: 'cold-brew', label: 'Cold Brew', src: '/drink-stickers/cold-brew.png' },
  { id: 'cold-brew-glass', label: 'Cold Brew Glass', src: '/drink-stickers/cold-brew-glass.png' },
  { id: 'iced-latte', label: 'Iced Latte', src: '/drink-stickers/iced-latte.png' },
  { id: 'iced-cappuccino', label: 'Iced Cappuccino', src: '/drink-stickers/iced-cappuccino.png' },
  { id: 'matcha', label: 'Matcha', src: '/drink-stickers/matcha.png' },
  { id: 'iced-matcha', label: 'Iced Matcha', src: '/drink-stickers/iced-matcha.png' },
]

export const DRINK_PRICE_PRESETS = [3.25, 4.5, 4.75, 4.85, 5, 5.5, 5.75]

const DRINK_STICKER_FALLBACKS = {
  espresso: '/drink-stickers/americano.png',
  americano: '/drink-stickers/americano.png',
  'double-espresso': '/drink-stickers/americano.png',
  drip: '/drink-stickers/americano.png',
  'matcha-latte': '/drink-stickers/matcha.png',
}

const DRINK_STICKER_BY_TYPE = Object.fromEntries(
  SIP_SPEND_DRINKS.map((drink) => [drink.drinkType, drink.sticker]),
)

export function getDrinkStickerSrc(drinkType) {
  return DRINK_STICKER_BY_TYPE[drinkType] ?? DRINK_STICKER_FALLBACKS[drinkType] ?? '/drink-stickers/latte.png'
}

export const MOCK_LOCATIONS = [
  'La Colombe, NY',
  'Blue Bottle, SF',
  'Cozy Grinds, Chi',
  'Stumptown, PDX',
  'Intelligentsia, LA',
  'Sightglass Café',
]

export const WEEKLY_BUDGET_LIMIT = 40

export const PRICE_RULER = {
  start: 1,
  end: 12,
  interval: 0.05,
  stepWidth: 8,
}
