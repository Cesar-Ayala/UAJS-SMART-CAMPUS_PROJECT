/**
 * Errores de aplicación. Los controladores los lanzan (throw) y el manejador
 * central (shared/http.js) los convierte en una respuesta JSON coherente:
 *
 *   { "message": "texto para el usuario", "code": "CODIGO_ESTABLE", "details": [...] }
 *
 * `details` es opcional y solo aparece en los errores de validación.
 */
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const badRequest = (message = 'La petición no es válida.', details, code = 'VALIDATION_ERROR') =>
  new AppError(400, code, message, details)

export const unauthorized = (message = 'No autenticado.', code = 'UNAUTHORIZED') =>
  new AppError(401, code, message)

export const forbidden = (message = 'No tienes permiso para realizar esta acción.', code = 'FORBIDDEN') =>
  new AppError(403, code, message)

export const notFound = (message = 'No se encontró el recurso solicitado.', code = 'NOT_FOUND') =>
  new AppError(404, code, message)

export const conflict = (message, code = 'CONFLICT') => new AppError(409, code, message)
