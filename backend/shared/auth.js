import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { forbidden, unauthorized } from './errors.js'

/**
 * Autenticación y autorización compartidas por todos los microservicios.
 *
 * Cada servicio verifica por sí mismo el token JWT (el Gateway solo reenvía la cabecera
 * Authorization), así que ninguno depende de que otro haya validado antes.
 *
 * Roles de usuario: estudiante, docente, administrativo, admin.
 * Rol interno 'service': lo usan los propios microservicios cuando se consultan entre sí.
 */
const jwtSecret = () => process.env.JWT_SECRET || 'dev-secret'

/**
 * Clave de las llamadas entre servicios. Se deriva del JWT_SECRET que todos comparten,
 * por lo que no hay que configurar nada más y nadie puede calcularla sin conocer el secreto.
 */
export const internalKey = () =>
  crypto.createHmac('sha256', jwtSecret()).update('uajs-internal-service').digest('hex')

function sameKey(received, expected) {
  const a = Buffer.from(String(received))
  const b = Buffer.from(String(expected))
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** Identifica quién hace la petición y deja el resultado en req.user = { id, rol }. */
export function authenticate(req, res, next) {
  // 1) Llamada interna entre microservicios.
  const internal = req.headers['x-internal-key']
  if (internal !== undefined) {
    if (!sameKey(internal, internalKey())) {
      return next(unauthorized('Clave de servicio inválida.', 'INTERNAL_KEY_INVALID'))
    }
    req.user = { id: null, rol: 'service' }
    return next()
  }

  // 2) Usuario con token JWT.
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(unauthorized('Token no proporcionado.', 'TOKEN_MISSING'))
  }
  try {
    const payload = jwt.verify(header.split(' ')[1], jwtSecret())
    req.user = { id: payload.id, rol: payload.rol }
    next()
  } catch {
    next(unauthorized('Token inválido o expirado.', 'TOKEN_INVALID'))
  }
}

/** Middleware: solo deja pasar a los roles indicados; a los demás les responde 403. */
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.rol) ? next() : next(forbidden())

// Ayudantes para decidir permisos dentro de los controladores.
export const isAdmin = (user) => user?.rol === 'admin'
export const isStaff = (user) => user?.rol === 'administrativo' || user?.rol === 'admin'
export const isService = (user) => user?.rol === 'service'
/** Quién puede ver los datos de todos los usuarios (el personal y los propios servicios). */
export const canSeeAll = (user) => isStaff(user) || isService(user)
