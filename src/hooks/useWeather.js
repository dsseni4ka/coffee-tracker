import { useEffect, useState } from 'react'

export function useWeatherRecommendation() {
  const [rec, setRec] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
          const res = await fetch(url)
          const data = await res.json()
          const temp = data.current?.temperature_2m ?? 20
          const code = data.current?.weather_code ?? 0

          let drink = 'Latte'
          let reason = 'A classic warm cup for a comfortable day.'

          if (temp >= 24) {
            drink = 'Cold Brew'
            reason = `It's ${Math.round(temp)}°C — perfect for iced coffee.`
          } else if (temp <= 10) {
            drink = 'Double Espresso'
            reason = `Chilly at ${Math.round(temp)}°C — go bold and warm.`
          } else if (code >= 51 && code <= 67) {
            drink = 'Cappuccino'
            reason = 'Rainy vibes call for something cozy.'
          } else if (temp >= 18) {
            drink = 'Matcha Latte'
            reason = 'Mild weather — light and refreshing.'
          }

          setRec({ drink, reason, temp: Math.round(temp) })
        } catch {
          setRec({ drink: 'Latte', reason: 'Could not fetch weather — try a latte!', temp: null })
        }
      },
      () => setRec(null),
      { timeout: 8000 }
    )
  }, [])

  return rec
}
