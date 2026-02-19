import axios from 'axios'

// Determine the base URL based on environment
// In production (Vercel), we MUST have VITE_API_URL set in Vercel dashboard
// In development, use relative path or localhost
const getBaseURL = () => {
  // Check if we're in production (Vite sets this automatically)
  if (import.meta.env.PROD) {
    // Production: use the environment variable
    // NOTE: For production, you MUST set VITE_API_URL in Vercel dashboard
    return import.meta.env.VITE_API_URL || ''
  }
  
  // Development: use relative path (Vite proxy) or localhost
  return import.meta.env.VITE_API_URL || '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000,
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
