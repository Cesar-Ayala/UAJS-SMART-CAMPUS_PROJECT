import { AppError } from './errors.js'
import { internalKey } from './auth.js'

/**
 * Cliente HTTP para que un microservicio consulte a otro.
 *
 * Cada servicio es dueño de sus datos: si Reservas necesita saber si un recurso
 * existe, se lo pregunta al servicio de Recursos por HTTP; nunca lee su tabla.
 * Las direcciones se pueden cambiar con variables de entorno (útil en Docker),
 * por ejemplo RESOURCES_SERVICE_URL=http://resources-service:4004
 */
const SERVICES = {
  users: {
    label: 'usuarios',
    url: () => process.env.USERS_SERVICE_URL || `http://localhost:${process.env.USERS_PORT || 4001}`
  },
  resources: {
    label: 'recursos',
    url: () => process.env.RESOURCES_SERVICE_URL || `http://localhost:${process.env.RESOURCES_PORT || 4004}`
  },
  notifications: {
    label: 'notificaciones',
    url: () => process.env.NOTIFICATIONS_SERVICE_URL || `http://localhost:${process.env.NOTIFICATIONS_PORT || 4006}`
  }
}

const unavailable = (service) =>
  new AppError(
    503,
    'DEPENDENCY_UNAVAILABLE',
    `No se pudo consultar el servicio de ${SERVICES[service].label}. Inténtalo de nuevo en unos minutos.`
  )

/** Hace la llamada. Si el servicio no responde lanza un error controlado (503). */
export async function callService(service, path, { method = 'GET', body, timeoutMs = 4000 } = {}) {
  let response
  try {
    response = await fetch(`${SERVICES[service].url()}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Internal-Key': internalKey() },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs)
    })
  } catch {
    throw unavailable(service)
  }

  let data = null
  try { data = await response.json() } catch { /* respuesta sin cuerpo JSON */ }
  return { status: response.status, data }
}

/**
 * Pide un registro a otro servicio: lo devuelve, o null si no existe (404).
 * Cualquier otra respuesta es una falla del servicio remoto y se informa como 503,
 * para no tomar decisiones con datos que no se pudieron comprobar.
 */
export async function fetchRecord(service, path) {
  const { status, data } = await callService(service, path)
  if (status === 200) return data
  if (status === 404) return null
  throw unavailable(service)
}
