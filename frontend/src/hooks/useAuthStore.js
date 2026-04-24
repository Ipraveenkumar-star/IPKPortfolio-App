import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,

      login: async (login, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { login, password })
          set({ user: data.user, token: data.token, refreshToken: data.refreshToken, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, error: err.response?.data?.error || 'Login failed' }
        }
      },

      register: async (username, email, password, displayName) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', { username, email, password, displayName })
          set({ user: data.user, token: data.token, refreshToken: data.refreshToken, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          const errors = err.response?.data?.errors
          const msg = errors ? errors.map(e => e.msg).join(', ') : (err.response?.data?.error || 'Registration failed')
          return { success: false, error: msg }
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout') } catch {}
        set({ user: null, token: null, refreshToken: null })
        delete api.defaults.headers.common['Authorization']
      },

      refreshAuth: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return false
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken })
          set({ token: data.token, refreshToken: data.refreshToken })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return true
        } catch {
          set({ user: null, token: null, refreshToken: null })
          return false
        }
      },

      setToken: (token) => {
        set({ token })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },

      isAdmin: () => get().user?.role === 'admin',
      isLoggedIn: () => !!get().user && !!get().token,
    }),
    {
      name: 'portfolio-auth',
      partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken })
    }
  )
)
