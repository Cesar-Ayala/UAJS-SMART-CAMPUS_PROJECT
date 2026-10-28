import jwt from 'jsonwebtoken'
import { UserModel } from '../models/userModel.js'
import { asyncHandler } from '../../../../shared/http.js'
import { conflict, forbidden, notFound, unauthorized } from '../../../../shared/errors.js'
import { validate } from '../../../../shared/validate.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { passwordRule, userRules } from '../validation/userRules.js'

function signToken(user) {
  return jwt.sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  )
}

export const AuthController = {
  register: asyncHandler(async (req, res) => {
    const data = validate(req.body, { ...userRules, password: passwordRule })

    if (await UserModel.findByEmail(data.correo)) {
      throw conflict('El correo ya está registrado.', 'DUPLICATE_ENTRY')
    }

    // El registro público SIEMPRE crea estudiantes. El rol nunca se toma del
    // cuerpo de la petición: de lo contrario cualquiera podría registrarse como admin.
    // Los demás roles los asigna un administrador.
    const user = await UserModel.create({
      nombre: data.nombre,
      correo: data.correo,
      password_hash: await hashPassword(data.password),
      rol: 'estudiante',
      programa: data.programa
    })
    res.status(201).json({ user, token: signToken(user) })
  }),

  login: asyncHandler(async (req, res) => {
    // El correo se recorta y pasa a minúsculas; la contraseña se usa tal cual.
    const { correo, password } = validate(req.body, {
      correo: { type: 'string', required: true, label: 'El correo' },
      password: { type: 'secret', required: true, label: 'La contraseña' }
    })

    const user = await UserModel.findByEmail(correo.toLowerCase())
    const passwordOk = await verifyPassword(password, user?.password_hash)
    if (!user || !passwordOk) throw unauthorized('Credenciales inválidas.', 'INVALID_CREDENTIALS')
    if (!user.activo) throw forbidden('La cuenta está desactivada.', 'ACCOUNT_DISABLED')

    delete user.password_hash
    res.json({ user, token: signToken(user) })
  }),

  me: asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user.id)
    if (!user) throw notFound('Usuario no encontrado.', 'USER_NOT_FOUND')
    res.json(user)
  })
}
