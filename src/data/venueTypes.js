export const VENUE_TYPES = [
  { id: 'cafe', label: 'Café', emoji: '☕' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'office', label: 'Office', emoji: '🏢' },
  { id: 'outdoor', label: 'Outdoors', emoji: '🌳' },
  { id: 'other', label: 'Other', emoji: '📍' },
]

export function getVenueType(id) {
  return VENUE_TYPES.find((v) => v.id === id)
}
