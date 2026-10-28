// El middleware de autenticación ahora es compartido por todos los servicios (backend/shared/auth.js).
export { authenticate as requireAuth } from '../../../../shared/auth.js'
