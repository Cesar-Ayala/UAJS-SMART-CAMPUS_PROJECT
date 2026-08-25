import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Ejemplos de endpoints ya mapeados al backend (ver backend/src/routes)
export const endpoints = {
  services: () => api.get('/services'),
  requests: () => api.get('/requests'),
  requestById: (id) => api.get(`/requests/${id}`),
  createRequest: (payload) => api.post('/requests', payload),
  reservations: () => api.get('/reservations'),
  resources: () => api.get('/resources'),
  events: () => api.get('/events'),
  notifications: () => api.get('/notifications'),
  profile: () => api.get('/users/me')
}
