import { SIP_SPEND_DRINKS } from '../data/sipSpendDrinks'
import { formatPrice } from '../utils/format'
import { useCafePhoto } from '../hooks/useCafePhoto'

const DEFAULT_LOCATION_BIAS = { lat: 52.3676, lng: 4.9041 }

const FEATURED_DRINK_PLACEHOLDERS = [
  {
    id: 'featured-cappuccino',
    drinkType: 'cappuccino',
    cafe: 'Blue Bottle',
    query: 'Blue Bottle Coffee',
    tag: 'Popular',
    coverImage: '/featured/blue-bottle-cappuccino.png',
  },
  {
    id: 'featured-iced-latte',
    drinkType: 'iced-latte',
    cafe: 'Sightglass',
    query: 'Sightglass Coffee',
    tag: 'Seasonal',
    coverImage: '/featured/sightglass-seasonal-latte.png',
  },
  {
    id: 'featured-flat-white',
    drinkType: 'flat-white',
    cafe: 'Stumptown',
    query: 'Stumptown Coffee Roasters',
    tag: 'Staff pick',
    coverImage: '/featured/stumptown-flat-white.png',
  },
  {
    id: 'featured-matcha',
    drinkType: 'matcha',
    cafe: 'La Colombe',
    query: 'La Colombe Coffee',
    tag: 'New',
    coverImage: '/featured/la-colombe-matcha.png',
  },
]

function getDrinkMeta(drinkType) {
  return SIP_SPEND_DRINKS.find((drink) => drink.drinkType === drinkType)
}

function getCafeLogoLetter(name) {
  const cleaned = name.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, '').trim()
  const letter = cleaned[0]
  return letter ? letter.toUpperCase() : '☕'
}

function FeaturedDrinkCard({ item, drink, locationBias }) {
  const { photoUrl, loading } = useCafePhoto(
    {
      name: item.cafe,
      query: item.query,
      lat: locationBias.lat,
      lng: locationBias.lng,
    },
    !item.coverImage,
  )

  const showCoverImage = Boolean(item.coverImage)

  return (
    <article className="home-card map-featured-card">
      <div className="map-featured-card-photo">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="map-featured-card-photo-img"
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div
            className={`map-featured-card-photo-fallback${showCoverImage ? ' map-featured-card-photo-fallback--image' : ''}${loading ? ' map-featured-card-photo-fallback--loading' : ''}`}
            aria-hidden
          >
            {showCoverImage ? (
              <img
                src={item.coverImage}
                alt=""
                className="map-featured-card-photo-img"
                loading="lazy"
                draggable={false}
              />
            ) : (
              getCafeLogoLetter(item.cafe)
            )}
          </div>
        )}
        <span className="map-featured-card-tag">{item.tag}</span>
      </div>
      <div className="map-featured-card-body">
        <h3 className="map-featured-card-name">{drink.name}</h3>
        <p className="map-featured-card-cafe">{item.cafe}</p>
        <p className="map-featured-card-price">{formatPrice(drink.basePrice)}</p>
      </div>
    </article>
  )
}

export default function MapFeaturedDrinks({ userCenter }) {
  const locationBias = userCenter
    ? { lat: userCenter[0], lng: userCenter[1] }
    : DEFAULT_LOCATION_BIAS

  return (
    <section className="map-featured-section" aria-label="Featured drinks">
      <div className="map-featured-header">
        <h2 className="map-featured-title">Featured Drinks</h2>
        <span className="map-featured-badge">Nearby picks</span>
      </div>

      <div className="map-featured-scroll">
        {FEATURED_DRINK_PLACEHOLDERS.map((item) => {
          const drink = getDrinkMeta(item.drinkType)
          if (!drink) return null

          return (
            <FeaturedDrinkCard
              key={item.id}
              item={item}
              drink={drink}
              locationBias={locationBias}
            />
          )
        })}
      </div>
    </section>
  )
}
