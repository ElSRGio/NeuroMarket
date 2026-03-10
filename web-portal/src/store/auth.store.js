/**
 * Auth Store — Zustand
 */
import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('nm_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('nm_token', token)
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('nm_token')
    set({ user: null, token: null })
  },
  isAuthenticated: () => !!localStorage.getItem('nm_token'),
}))
