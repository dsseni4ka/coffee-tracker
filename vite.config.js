import os from 'node:os'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

function phoneDevLink() {
  return {
    name: 'phone-dev-link',
    configureServer(server) {
      server.middlewares.use('/__dev/phone-url', (_req, res) => {
        const port = server.config.server.port ?? 5173
        const urls = []
        for (const ifaces of Object.values(os.networkInterfaces())) {
          if (!ifaces) continue
          for (const iface of ifaces) {
            if (iface.family === 'IPv4' && !iface.internal) {
              urls.push(`http://${iface.address}:${port}`)
            }
          }
        }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ urls }))
      })
    },
  }
}

export default defineConfig({
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
  plugins: [
    phoneDevLink(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Coffee Tracker',
        short_name: 'Coffee',
        description: 'Track coffee habits and caffeine intake',
        theme_color: '#F9F8F3',
        background_color: '#F6F4F1',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png,woff2}'],
      },
    }),
  ],
})
