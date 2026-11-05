import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        // À mettre à jour en même temps que src/config/brand.ts
        name: 'Jënd Jaay',
        short_name: 'JendJaay',
        description: "Achète et vends d'occasion, sans risque, au Sénégal.",
        lang: 'fr',
        start_url: '/',
        display: 'standalone',
        background_color: '#F6EFE4',
        theme_color: '#B9491F',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        // Les photos des annonces seront servies par un CDN : on garde le cache léger.
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
})
