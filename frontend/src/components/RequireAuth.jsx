import { Navigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'

/**
 * RequireAuth — envuelve las rutas internas de la plataforma.
 * Si no hay una sesión activa (sin token), redirige al login.
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useUser()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}
