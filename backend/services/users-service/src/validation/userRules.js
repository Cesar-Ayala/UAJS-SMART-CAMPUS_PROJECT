export const ROLES = ['estudiante', 'docente', 'administrativo', 'admin']

export const userRules = {
  nombre: { type: 'string', required: true, maxLength: 150, label: 'El nombre' },
  correo: { type: 'email', required: true, label: 'El correo' },
  programa: { type: 'string', maxLength: 150, label: 'El programa' }
}

// bcrypt solo procesa los primeros 72 bytes, por eso ese es el máximo.
export const passwordRule = {
  type: 'secret', required: true, minLength: 8, maxLength: 72, label: 'La contraseña'
}

export const roleRule = { type: 'enum', values: ROLES, label: 'El rol' }
