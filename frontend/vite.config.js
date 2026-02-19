import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get API URL safely - only available at runtime, not at config load time
const getApiUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
    return process.env.VITE_API_URL
  }
  return 'http://localhost:8000'
}

export default defineConfig({
  plugins: [react()],
  base: '/',
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
