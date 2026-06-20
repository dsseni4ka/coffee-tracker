import os from 'node:os'
import { resolve } from 'node:path'
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
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        landing: resolve(__dirname, 'landing/index.html'),
      },
    },
  },
  plugins: [
    phoneDevLink(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'sipspend-icon.svg'],
      manifest: {
        name: 'SipSpend',
        short_name: 'SipSpend',
        description: 'Track every sip, every spend — log drinks and watch your weekly budget',
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
