import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  appType: 'spa',
  server: {
    host: '0.0.0.0',
    port: 5173,
    middlewareMode: false
  },
  preview: {
    port: 4173
  }
})
