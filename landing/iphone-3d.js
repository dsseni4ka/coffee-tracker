/*
 * Interactive 3D rotation — adapted from Styly IO's IPhoneMockup (MIT License)
 * https://github.com/tercumantanumut/phone3d-css-styly-io
 */

const ROTATION_LIMITS = { minY: -25, maxY: 15, minX: -8, maxX: 12 }
const BASE_ROTATION = { x: 2, y: -12 }
const SCALE = () =>
  parseFloat(getComputedStyle(document.querySelector('.landing-hero-visual') || document.documentElement)
    .getPropertyValue('--iphone-scale')) || 0.78

function clampRotation(x, y) {
  return {
    x: Math.max(ROTATION_LIMITS.minX, Math.min(ROTATION_LIMITS.maxX, x)),
    y: Math.max(ROTATION_LIMITS.minY, Math.min(ROTATION_LIMITS.maxY, y)),
  }
}

export function initIphone3d() {
  const scene = document.getElementById('iphone-3d')
  const device = scene?.querySelector('.iphone-3d-device')
  if (!scene || !device) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let rotation = { ...BASE_ROTATION }
  let isDragging = false
  let autoRotatePhase = 0
  let dragStart = { x: 0, y: 0, rotX: 0, rotY: 0 }
  let rafId = null

  function applyTransform() {
    const autoOffset = isDragging || reducedMotion ? 0 : Math.sin(autoRotatePhase) * 9
    const scale = SCALE()
    device.style.transform = `rotateY(${rotation.y + autoOffset}deg) rotateX(${rotation.x}deg) scale(${scale})`
    device.style.transitionDuration = isDragging ? '0ms' : '100ms'
  }

  function tick() {
    if (!isDragging && !reducedMotion) {
      autoRotatePhase += 0.022
    }

    if (!isDragging) {
      const dx = BASE_ROTATION.x - rotation.x
      const dy = BASE_ROTATION.y - rotation.y

      if (Math.abs(dx) >= 0.5 || Math.abs(dy) >= 0.5) {
        rotation = {
          x: rotation.x + dx * 0.05,
          y: rotation.y + dy * 0.05,
        }
      } else if (!reducedMotion) {
        rotation = { ...BASE_ROTATION }
      }
    }

    applyTransform()
    rafId = requestAnimationFrame(tick)
  }

  function shouldIgnoreDrag(target) {
    if (!(target instanceof Element)) return false
    if (target.closest('[data-iphone-interactive="true"]')) return true
    if (target.closest('button, a, input, select, textarea, [role="button"]')) return true
    return false
  }

  scene.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if (shouldIgnoreDrag(e.target)) return

    isDragging = true
    scene.classList.add('is-dragging')
    dragStart = { x: e.clientX, y: e.clientY, rotX: rotation.x, rotY: rotation.y }
    scene.setPointerCapture(e.pointerId)
  })

  scene.addEventListener('pointermove', (e) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    const sensitivity = 0.3

    rotation = clampRotation(
      dragStart.rotX - deltaY * sensitivity * 0.5,
      dragStart.rotY + deltaX * sensitivity,
    )
  })

  function endDrag(e) {
    isDragging = false
    scene.classList.remove('is-dragging')
    if (scene.hasPointerCapture(e.pointerId)) {
      scene.releasePointerCapture(e.pointerId)
    }
  }

  scene.addEventListener('pointerup', endDrag)
  scene.addEventListener('pointercancel', endDrag)

  applyTransform()
  rafId = requestAnimationFrame(tick)

  return () => {
    if (rafId) cancelAnimationFrame(rafId)
  }
}
