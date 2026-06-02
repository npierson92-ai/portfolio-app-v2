import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', version: "2.2",
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Portfolio Tracker',
        short_name: 'Portfolio',
        description: '5-year growth portfolio tracker with trim alerts',
        theme_color: '#060d1a',
        background_color: '#060d1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          { urlPattern: /^https:\/\/.*\.railway\.app\/.*/i, handler: 'NetworkOnly' }
        ]
      }
    })
  ]
})
