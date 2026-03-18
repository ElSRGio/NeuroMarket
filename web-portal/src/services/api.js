/**
 * API Client — Axios instance with JWT interceptor
 */
import axios from 'axios'

const rawApiUrl = import.meta.env.VITE_API_URL || ''
const normalizedApiUrl = rawApiUrl.replace(/\/$/, '')
const fallbackApiUrl = 'https://neuromarket-api.onrender.com'
const baseURL = import.meta.env.DEV ? '' : (normalizedApiUrl || fallbackApiUrl)
const rawEngineUrl = import.meta.env.VITE_ENGINE_URL || ''
const normalizedEngineUrl = rawEngineUrl.replace(/\/$/, '')
const fallbackEngineUrl = 'https://neuromarket-engine.onrender.com'
export const engineBaseUrl = import.meta.env.DEV ? '' : (normalizedEngineUrl || fallbackEngineUrl)
export const engineUrl = (path) => `${engineBaseUrl}${path}`

const api = axios.create({
  baseURL,
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
      // No recargar la pantalla si el error 401 provino del intento de login o registro
      const url = err.config?.url;
      if (url && !url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('nm_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
