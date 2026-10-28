import { useUser } from '../context/UserContext.jsx'

const STAFF = ['administrativo', 'admin']

/**
 * usePermissions — custom hook que dice qué puede hacer el usuario de la sesión según su rol.
 * Solo decide qué opciones MOSTRAR; el backend es quien valida de verdad cada acción
 * (ver la matriz de permisos en backend/README.md).
 */
export default function usePermissions() {
  const { user } = useUser()
  const rol = user?.rol ?? null

  return {
    rol,
    // Agregar, activar/desactivar y eliminar recursos.
    canManageResources: STAFF.includes(rol),
    // Validar, denegar y avanzar el estado de las solicitudes.
    canManageRequests: STAFF.includes(rol),
    // Publicar eventos (el docente solo puede modificar los suyos).
    canPublishEvents: rol === 'docente' || STAFF.includes(rol)
  }
}
