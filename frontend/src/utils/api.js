import axios from 'axios'

// Dev: proxy via Vite. Production (GitHub Pages): use VITE_API_URL env var
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

// Attach stored token on startup
const stored = localStorage.getItem('portfolio-auth')
if (stored) {
  try {
    const { state } = JSON.parse(stored)
    if (state?.token) api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
  } catch {}
}

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const stored = localStorage.getItem('portfolio-auth')
        if (stored) {
          const { state } = JSON.parse(stored)
          if (state?.refreshToken) {
            const { data } = await axios.post('/api/auth/refresh', { refreshToken: state.refreshToken })
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
            original.headers['Authorization'] = `Bearer ${data.token}`
            // Update stored tokens
            const newState = { ...state, token: data.token, refreshToken: data.refreshToken }
            localStorage.setItem('portfolio-auth', JSON.stringify({ state: newState }))
            return api(original)
          }
        }
      } catch {}
    }
    return Promise.reject(err)
  }
)

export default api
