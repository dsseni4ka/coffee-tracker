const MAX_DIMENSION = 512
const JPEG_QUALITY = 0.82
const MAX_OUTPUT_BYTES = 180 * 1024

function estimateDataUrlBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1] ?? ''
  return Math.ceil((base64.length * 3) / 4)
}

export function isProfilePhotoFile(file) {
  if (!file) return false
  if (!file.type) return true
  return file.type.startsWith('image/')
}

export function prepareProfilePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!isProfilePhotoFile(file)) {
      reject(new Error('Not an image'))
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)

      try {
        const longestSide = Math.max(img.width, img.height)
        const scale = longestSide > MAX_DIMENSION ? MAX_DIMENSION / longestSide : 1
        const width = Math.max(1, Math.round(img.width * scale))
        const height = Math.max(1, Math.round(img.height * scale))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not process image'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        let quality = JPEG_QUALITY
        let dataUrl = canvas.toDataURL('image/jpeg', quality)

        while (estimateDataUrlBytes(dataUrl) > MAX_OUTPUT_BYTES && quality > 0.45) {
          quality -= 0.08
          dataUrl = canvas.toDataURL('image/jpeg', quality)
        }

        resolve(dataUrl)
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not process image'))
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load image'))
    }

    img.src = url
  })
}
