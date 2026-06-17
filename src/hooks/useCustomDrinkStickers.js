import { useCallback, useState } from 'react'

const STORAGE_KEY = 'coffee-tracker-custom-drink-stickers'
const MAX_STICKERS = 20
const MAX_FILE_BYTES = 512 * 1024

function loadCustomStickers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* ignore */
  }
  return []
}

function persistCustomStickers(stickers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stickers))
}

export function useCustomDrinkStickers() {
  const [customStickers, setCustomStickers] = useState(loadCustomStickers)

  const addCustomSticker = useCallback((file) => {
    if (!file?.type?.startsWith('image/')) {
      return Promise.reject(new Error('Not an image'))
    }
    if (file.size > MAX_FILE_BYTES) {
      return Promise.reject(new Error('Image must be under 512 KB'))
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const src = reader.result
        const label = file.name.replace(/\.[^.]+$/, '') || 'Custom'
        const sticker = {
          id: `custom-sticker-${Date.now()}`,
          label,
          src,
          custom: true,
        }

        setCustomStickers((prev) => {
          const next = [...prev, sticker].slice(-MAX_STICKERS)
          persistCustomStickers(next)
          return next
        })
        resolve(sticker)
      }
      reader.onerror = () => reject(reader.error ?? new Error('Could not read image'))
      reader.readAsDataURL(file)
    })
  }, [])

  return { customStickers, addCustomSticker }
}
