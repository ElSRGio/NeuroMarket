import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api/engine': { target: 'https://neuromarket-engine.onrender.com', changeOrigin: true, secure: true },
      '/api': { target: 'https://neuromarket-api.onrender.com', changeOrigin: true, secure: true },
    },
  },
})
