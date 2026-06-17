const FLY_DURATION_MS = 720
const FLY_APPROACH_AT = 0.78
const COLLAGE_STICKER_SIZE = 56
const FLYER_FADE_MS = 180

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export { wait }

export async function animateDrinkToCollage({ fromRect, stickerSrc, targetEl, onApproach }) {
  if (!fromRect || !stickerSrc || !targetEl) return

  const targetRect = targetEl.getBoundingClientRect()
  const startSize = Math.max(fromRect.width, fromRect.height)
  const endSize = COLLAGE_STICKER_SIZE

  const startX = fromRect.left + fromRect.width / 2
  const startY = fromRect.top + fromRect.height / 2
  const endX = targetRect.left + targetRect.width / 2
  const endY = targetRect.top + targetRect.height / 2
  const arcY = Math.min(startY, endY) - Math.min(72, Math.abs(startY - endY) * 0.35)

  const flyer = document.createElement('img')
  flyer.src = stickerSrc
  flyer.alt = ''
  flyer.className = 'drink-fly-sticker'
  flyer.draggable = false

  Object.assign(flyer.style, {
    position: 'fixed',
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${startSize}px`,
    height: `${startSize}px`,
    transform: 'translate(-50%, -50%) rotate(0deg) scale(1)',
    zIndex: '10000',
    pointerEvents: 'none',
    objectFit: 'contain',
    filter: 'drop-shadow(0 10px 20px rgba(44, 37, 32, 0.28))',
  })

  document.body.appendChild(flyer)

  let approachCalled = false
  const approachTimer = setTimeout(() => {
    if (approachCalled) return
    approachCalled = true
    onApproach?.()
  }, FLY_DURATION_MS * FLY_APPROACH_AT)

  const animation = flyer.animate(
    [
      {
        left: `${startX}px`,
        top: `${startY}px`,
        width: `${startSize}px`,
        height: `${startSize}px`,
        transform: 'translate(-50%, -50%) rotate(0deg) scale(1)',
        opacity: 1,
      },
      {
        offset: 0.55,
        left: `${(startX + endX) / 2}px`,
        top: `${arcY}px`,
        width: `${(startSize + endSize) / 2}px`,
        height: `${(startSize + endSize) / 2}px`,
        transform: 'translate(-50%, -50%) rotate(-10deg) scale(1.04)',
        opacity: 1,
      },
      {
        left: `${endX}px`,
        top: `${endY}px`,
        width: `${endSize}px`,
        height: `${endSize}px`,
        transform: 'translate(-50%, -50%) rotate(-6deg) scale(1)',
        opacity: 1,
      },
    ],
    {
      duration: FLY_DURATION_MS,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    },
  )

  await animation.finished.catch(() => {})
  clearTimeout(approachTimer)

  if (!approachCalled) {
    approachCalled = true
    onApproach?.()
  }

  const fade = flyer.animate(
    [
      {
        opacity: 1,
        transform: 'translate(-50%, -50%) rotate(-6deg) scale(1)',
      },
      {
        opacity: 0,
        transform: 'translate(-50%, -50%) rotate(-6deg) scale(0.88)',
      },
    ],
    {
      duration: FLYER_FADE_MS,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
    },
  )

  await fade.finished.catch(() => {})
  flyer.remove()
}
