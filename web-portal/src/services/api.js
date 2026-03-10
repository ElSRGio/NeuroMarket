/**
 * API Client — Axios instance with JWT interceptor
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '',   // relative URLs — Vite proxy forwards to localhost:3000
  timeout: 30000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('nm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nm_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
