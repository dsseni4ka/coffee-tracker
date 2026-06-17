import Dexie from 'dexie'
import { getCaffeineForDrink } from '../data/drinkTypes'
import { getSizeOption } from '../data/cupOptions'

export const db = new Dexie('CoffeeTracker')

db.version(1).stores({
  drinks: '++id, drinkType, timestamp, dateKey',
  posts: '++id, timestamp',
  cafeRatings: '++id, name',
})

db.version(2).stores({
  drinks: '++id, drinkType, timestamp, dateKey',
  posts: '++id, timestamp, drinkId',
  cafeRatings: '++id, name',
})

export function toDateKey(date = new Date()) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function buildPlaceName({ venueId, venueLabel, venueEmoji, cafeName, homemade, name }) {
  if (homemade) return '🏠 Homemade coffee'
  const parts = []
  if (venueEmoji && venueLabel) parts.push(`${venueEmoji} ${venueLabel}`)
  if (cafeName?.trim()) parts.push(cafeName.trim())
  else if (name?.trim()) parts.push(name.trim())
  return parts.join(' · ') || ''
}

export async function addDrink({
  drinkType,
  size = 1,
  sizeLabel = 'medium',
  notes = '',
  photo = null,
  lat = null,
  lng = null,
  placeName = '',
  venueId = '',
  cafeName = '',
  name = '',
  temperature = 'hot',
  rating = null,
  price = null,
  homemade = false,
  caffeine: caffeineOverride,
  caffeineKnown = true,
  loggedAt = new Date(),
}) {
  const timestamp = loggedAt instanceof Date ? loggedAt.getTime() : Number(loggedAt)
  const dateKey = toDateKey(new Date(timestamp))
  const sizeMultiplier = getSizeOption(sizeLabel)?.multiplier ?? size
  const caffeine =
    caffeineKnown && caffeineOverride != null
      ? caffeineOverride
      : caffeineKnown
        ? getCaffeineForDrink(drinkType, sizeMultiplier)
        : null

  return db.drinks.add({
    drinkType,
    size: sizeMultiplier,
    sizeLabel,
    notes,
    photo,
    lat,
    lng,
    placeName,
    venueId,
    cafeName,
    name,
    temperature,
    rating,
    price,
    homemade,
    caffeine,
    caffeineKnown,
    timestamp,
    dateKey,
  })
}

export async function getDrinksForDate(dateKey) {
  return db.drinks.where('dateKey').equals(dateKey).reverse().sortBy('timestamp')
}

export async function getAllDrinks() {
  return db.drinks.orderBy('timestamp').reverse().toArray()
}

export async function deleteDrink(id) {
  return db.drinks.delete(id)
}

export async function deleteDrinks(ids) {
  return db.drinks.bulkDelete(ids)
}

export async function getDrinksSince(sinceMs) {
  return db.drinks.where('timestamp').aboveOrEqual(sinceMs).reverse().sortBy('timestamp')
}

export async function getDrinksInRange(startKey, endKey) {
  return db.drinks.where('dateKey').between(startKey, endKey, true, true).toArray()
}

export async function getDrinksWithLocation() {
  return db.drinks.filter((d) => d.lat != null && d.lng != null).toArray()
}

export async function addPost({
  caption,
  photo = null,
  drinkId = null,
  timestamp = Date.now(),
  cafeName = '',
  lat = null,
  lng = null,
}) {
  return db.posts.add({ caption, photo, drinkId, timestamp, cafeName, lat, lng })
}

export async function getPosts() {
  return db.posts.orderBy('timestamp').reverse().toArray()
}

export async function addCafeRating({ name, rating, note = '' }) {
  return db.cafeRatings.add({ name, rating, note, timestamp: Date.now() })
}

export async function getCafeRatings() {
  return db.cafeRatings.orderBy('timestamp').reverse().toArray()
}
