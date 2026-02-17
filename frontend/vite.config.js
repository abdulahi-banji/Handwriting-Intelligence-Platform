import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dynamic base URL for production - will be set via VITE_API_URL env var
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
