/**
 * Auth Store — Zustand
 */
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('nm_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('nm_token', token)
    localStorage.setItem('nm_session_started_at', new Date().toISOString())
    set({ user, token })
  },
  setUser: (user) => set((state) => ({ ...state, user })),
  logout: () => {
    localStorage.removeItem('nm_token')
    localStorage.removeItem('nm_session_started_at')
    set({ user: null, token: null })
  },
  isAuthenticated: () => !!localStorage.getItem('nm_token'),
}))
