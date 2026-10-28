import { AppError } from './errors.js'

/** Envuelve un controlador async: cualquier error lanzado llega al manejador central. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

export function notFoundHandler(serviceName) {
  return (req, res) =>
    res.status(404).json({
      message: `Ruta no encontrada en ${serviceName}.`,
      code: 'ROUTE_NOT_FOUND'
    })
}

// Errores del motor de base de datos que se traducen a respuestas controladas.
const DB_UNAVAILABLE = new Set([
  'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'PROTOCOL_CONNECTION_LOST',
  'ER_CON_COUNT_ERROR', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR'
])
const DB_INVALID_DATA = new Set([
  'ER_BAD_NULL_ERROR', 'ER_DATA_TOO_LONG', 'ER_TRUNCATED_WRONG_VALUE',
  'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD', 'WARN_DATA_TRUNCATED', 'ER_WRONG_VALUE_FOR_TYPE',
  'ER_WARN_DATA_OUT_OF_RANGE', 'ER_NO_DEFAULT_FOR_FIELD'
])

// Mensajes para las restricciones UNIQUE (se busca el nombre de la restricción en el error).
const DUPLICATES = [
  ['uq_reserva_franja', 'RESERVATION_CONFLICT', 'Ese recurso ya está reservado en la franja elegida.'],
  ['correo', 'DUPLICATE_ENTRY', 'El correo ya está registrado.'],
  ['codigo', 'DUPLICATE_ENTRY', 'Ya existe un registro con ese código.']
]

function toResponse(err) {
  if (err instanceof AppError) {
    const body = { message: err.message, code: err.code }
    if (err.details) body.details = err.details
    return { status: err.status, body }
  }

  // Cuerpo JSON mal formado o demasiado grande (lo detecta express.json()).
  if (err.type === 'entity.parse.failed') {
    return { status: 400, body: { message: 'El cuerpo de la petición no es un JSON válido.', code: 'INVALID_JSON' } }
  }
  if (err.type === 'entity.too.large') {
    return { status: 413, body: { message: 'El cuerpo de la petición es demasiado grande.', code: 'PAYLOAD_TOO_LARGE' } }
  }

  // Errores de MySQL / MariaDB: nunca se reenvía el texto técnico al cliente.
  if (err.code === 'ER_DUP_ENTRY') {
    const known = DUPLICATES.find(([key]) => String(err.sqlMessage).includes(key))
    const [, code, message] = known || [null, 'DUPLICATE_ENTRY', 'Ya existe un registro con esos datos.']
    return { status: 409, body: { message, code } }
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return { status: 400, body: { message: 'El usuario o el recurso indicado no existe.', code: 'INVALID_REFERENCE' } }
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return { status: 409, body: { message: 'No se puede eliminar: el registro está en uso por otros datos.', code: 'IN_USE' } }
  }
  if (DB_INVALID_DATA.has(err.code)) {
    return { status: 400, body: { message: 'Algún dato tiene un valor o un formato no válido.', code: 'VALIDATION_ERROR' } }
  }
  if (DB_UNAVAILABLE.has(err.code)) {
    return { status: 503, body: { message: 'El servicio no pudo conectarse a la base de datos. Inténtalo de nuevo en unos minutos.', code: 'DATABASE_UNAVAILABLE' } }
  }

  return { status: 500, body: { message: 'Error interno del servidor.', code: 'INTERNAL_ERROR' } }
}

/** Manejador central de errores: se registra al final de cada servicio. */
export function errorHandler(serviceName) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, next) => {
    if (res.headersSent) return next(err)
    const { status, body } = toResponse(err)
    // Solo los errores del servidor se registran; el detalle técnico queda en el log.
    if (status >= 500) console.error(`[${serviceName}] ${req.method} ${req.originalUrl}:`, err)
    res.status(status).json(body)
  }
}
