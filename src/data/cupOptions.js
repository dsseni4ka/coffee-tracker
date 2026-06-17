export const SIZE_OPTIONS = [
  { id: 'small', label: 'Small', multiplier: 0.75, volumeMl: 250 },
  { id: 'medium', label: 'Medium', multiplier: 1, volumeMl: 350 },
  { id: 'large', label: 'Large', multiplier: 1.25, volumeMl: 450 },
  { id: 'xl', label: 'XL', multiplier: 1.5, volumeMl: 550 },
]

export const TEMPERATURE_OPTIONS = [
  { id: 'iced', label: 'Iced', emoji: '🧊' },
  { id: 'hot', label: 'Hot', emoji: '♨️' },
]

export const SHARE_TARGETS = [
  { id: 'calendar', label: 'My calendar' },
]

export function getSizeOption(id) {
  return SIZE_OPTIONS.find((s) => s.id === id)
}
