import QRCode from 'qrcode'
import { initIphone3d } from './iphone-3d.js'

function isLocalhost(url) {
  try {
    const { hostname } = new URL(url)
    return hostname === 'localhost' || hostname === '127.0.0.1'
  } catch {
    return false
  }
}

async function resolveAppUrl() {
  const metaUrl = document.querySelector('meta[name="coffee-app-url"]')?.content?.trim()
  if (metaUrl && metaUrl !== '/') {
    return metaUrl.startsWith('http') ? metaUrl : new URL(metaUrl, window.location.origin).href
  }

  const params = new URLSearchParams(window.location.search)
  const queryUrl = params.get('app')
  if (queryUrl) {
    return queryUrl.startsWith('http') ? queryUrl : new URL(queryUrl, window.location.origin).href
  }

  if (import.meta.env.DEV && isLocalhost(window.location.origin)) {
    try {
      const res = await fetch('/__dev/phone-url')
      const data = await res.json()
      const networkUrl = data.urls?.[0]
      if (networkUrl) return networkUrl
    } catch {
      // fall through to same-origin default
    }
  }

  return new URL('/', window.location.origin).href
}

function wireLinks(appUrl) {
  for (const id of ['header-cta', 'hero-cta', 'footer-cta', 'app-link']) {
    const el = document.getElementById(id)
    if (!el) continue
    el.href = appUrl
    if (id === 'app-link') el.textContent = appUrl.replace(/^https?:\/\//, '')
  }
}

async function renderQr(appUrl) {
  const canvas = document.getElementById('qr-canvas')
  if (!canvas) return

  await QRCode.toCanvas(canvas, appUrl, {
    width: 240,
    margin: 1,
    color: {
      dark: '#2c2520',
      light: '#ffffff',
    },
  })
}

async function init() {
  initIphone3d()
  const appUrl = await resolveAppUrl()
  wireLinks(appUrl)
  await renderQr(appUrl)
}

init()
