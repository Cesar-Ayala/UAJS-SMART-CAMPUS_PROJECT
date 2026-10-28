import { callService } from './serviceClient.js'

/**
 * Crea una notificación para un usuario llamando al servicio de Notificaciones.
 *
 * Es "mejor esfuerzo": si el servicio de Notificaciones está caído la operación
 * principal (crear la reserva, cambiar el estado...) NO falla; solo se registra el aviso en el log.
 * Devuelve true si la notificación se creó.
 */
export async function notifyUser({ usuario_id, titulo, mensaje, tipo = 'sistema', entidad, entidad_id }) {
  if (!usuario_id) return false
  try {
    const { status } = await callService('notifications', '/api/notifications', {
      method: 'POST',
      body: { usuario_id, titulo, mensaje, tipo, entidad, entidad_id },
      timeoutMs: 3000
    })
    if (status !== 201) {
      console.warn(`[notify] el servicio de notificaciones respondió ${status}`)
      return false
    }
    return true
  } catch (error) {
    console.warn('[notify] no se pudo crear la notificación:', error.message)
    return false
  }
}
