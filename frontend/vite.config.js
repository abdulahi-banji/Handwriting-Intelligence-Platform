import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dynamic base URL for production
const baseUrl = process.env.VITE_API_URL || '/api';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
