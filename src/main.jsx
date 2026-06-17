import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './styles/global.css'
import App from './App.jsx'

try {
  document.documentElement.dataset.theme =
    localStorage.getItem('coffee-tracker-theme') || 'light'
} catch {
  document.documentElement.dataset.theme = 'light'
}

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
