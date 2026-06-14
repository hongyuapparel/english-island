import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// On GitHub Pages the app is served from /<repo>/, so production assets
// need that base. Locally we serve from the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/english-island/' : '/',
  plugins: [tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
}))
