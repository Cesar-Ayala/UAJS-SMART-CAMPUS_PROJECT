import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { UserModel } from '../models/userModel.js'

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  )
}

export const AuthController = {
  async register(req, res) {
    try {
      const { nombre, correo, password, rol, programa } = req.body
      const existing = await UserModel.findByEmail(correo)
      if (existing) return res.status(409).json({ message: 'El correo ya está registrado.' })

      const user = await UserModel.create({
        nombre,
        correo,
        password_hash: hashPassword(password),
        rol,
        programa
      })
      const token = signToken(user)
      res.status(201).json({ user, token })
    } catch (error) {
      res.status(400).json({ message: 'Error al registrar el usuario.', error: error.message })
    }
  },

  async login(req, res) {
    try {
      const { correo, password } = req.body
      const user = await UserModel.findByEmail(correo)
      if (!user || user.password_hash !== hashPassword(password)) {
        return res.status(401).json({ message: 'Credenciales inválidas.' })
      }
      const token = signToken(user)
      delete user.password_hash
      res.json({ user, token })
    } catch (error) {
      res.status(400).json({ message: 'Error al iniciar sesión.', error: error.message })
    }
  },

  async me(req, res) {
    try {
      const user = await UserModel.findById(req.user.id)
      res.json(user)
    } catch (error) {
      res.status(400).json({ message: 'Error al consultar el perfil.', error: error.message })
    }
  }
}
