import axios from 'axios'

// El frontend SIEMPRE habla con el API Gateway (puerto 4000).
// El Gateway es quien decide a qué microservicio reenviar cada petición.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

// Adjunta automáticamente el token guardado (si existe) a cada petición.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('uajs_smart_campus_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const endpoints = {
  // Autenticación (vive dentro de users-service, bajo /api/users/auth/*)
  login: (credentials) => api.post('/users/auth/login', credentials),
  register: (payload) => api.post('/users/auth/register', payload),
  me: () => api.get('/users/auth/me'),

  // Servicios y datos de la plataforma (cada uno resuelto por su microservicio)
  requests: () => api.get('/requests'),
  requestById: (id) => api.get(`/requests/${id}`),
  createRequest: (payload) => api.post('/requests', payload),
  reservations: () => api.get('/reservations'),
  resources: () => api.get('/resources'),
  events: () => api.get('/events'),
  notifications: () => api.get('/notifications'),
  profile: () => api.get('/users/auth/me')
}
