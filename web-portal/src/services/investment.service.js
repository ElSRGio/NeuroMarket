import api from './api'

export const authService = {
  register: (data) => api.post('/api/v2/auth/register', data),
  login: (data) => api.post('/api/v2/auth/login', data),
}

export const investmentService = {
  analyze: (payload) => api.post('/api/v2/investment/analyze', payload),
  getHistory: () => api.get('/api/v2/investment/history'),
  getOne: (id) => api.get(`/api/v2/investment/${id}`),
}
