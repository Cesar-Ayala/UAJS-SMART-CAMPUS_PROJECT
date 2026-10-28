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

// Si el servidor responde que el token falta o venció, la sesión ya no sirve: se limpia y se vuelve
// al login. Sin esto la aplicación seguiría mostrando datos de ejemplo sin avisar que no hay sesión.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error.response?.data?.code
    if (error.response?.status === 401 && (code === 'TOKEN_INVALID' || code === 'TOKEN_MISSING')) {
      localStorage.removeItem('uajs_smart_campus_token')
      localStorage.removeItem('uajs_smart_campus_user')
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  }
)

export const endpoints = {
  // Autenticación (vive dentro de users-service, bajo /api/users/auth/*)
  login: (credentials) => api.post('/users/auth/login', credentials),
  register: (payload) => api.post('/users/auth/register', payload),
  me: () => api.get('/users/auth/me'),

  // Servicios y datos de la plataforma (cada uno resuelto por su microservicio)
  requests: () => api.get('/requests'),
  requestById: (id) => api.get(`/requests/${id}`),
  createRequest: (payload) => api.post('/requests', payload),
  updateRequestStatus: (id, payload) => api.patch(`/requests/${id}/estado`, payload),
  reservations: () => api.get('/reservations'),
  createReservation: (payload) => api.post('/reservations', payload),
  resources: () => api.get('/resources'),
  createResource: (payload) => api.post('/resources', payload),
  setResourceAvailability: (id, disponible) => api.patch(`/resources/${id}/disponibilidad`, { disponible }),
  deleteResource: (id) => api.delete(`/resources/${id}`),
  events: () => api.get('/events'),
  createEvent: (payload) => api.post('/events', payload),
  notifications: () => api.get('/notifications'),
  profile: () => api.get('/users/auth/me')
}
