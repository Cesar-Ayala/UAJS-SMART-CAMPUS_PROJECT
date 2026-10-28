import { UserModel } from '../models/userModel.js'
import { asyncHandler } from '../../../../shared/http.js'
import { conflict, forbidden, notFound } from '../../../../shared/errors.js'
import { canSeeAll, isAdmin } from '../../../../shared/auth.js'
import { parseId, validate } from '../../../../shared/validate.js'
import { hashPassword } from '../utils/password.js'
import { passwordRule, roleRule, userRules } from '../validation/userRules.js'

// Regla: el sistema siempre debe conservar al menos un administrador activo; de lo contrario
// nadie podría volver a gestionar usuarios ni roles.
async function assertNotLastAdmin(user, { willBeAdmin, willBeActive }) {
  const isActiveAdmin = user.rol === 'admin' && Boolean(user.activo)
  if (!isActiveAdmin || (willBeAdmin && willBeActive)) return
  if ((await UserModel.countActiveAdmins()) <= 1) {
    throw conflict(
      'No se puede quitar el acceso al único administrador activo del sistema.',
      'LAST_ADMIN'
    )
  }
}

async function findOrFail(idParam) {
  const user = await UserModel.findById(parseId(idParam))
  if (!user) throw notFound('Usuario no encontrado.', 'USER_NOT_FOUND')
  return user
}

export const UserController = {
  list: asyncHandler(async (req, res) => {
    res.json(await UserModel.findAll())
  }),

  // Cada usuario puede ver su propio perfil; el personal y los servicios, el de cualquiera.
  getById: asyncHandler(async (req, res) => {
    const user = await findOrFail(req.params.id)
    if (!canSeeAll(req.user) && user.id !== req.user.id) {
      throw forbidden('No tienes permiso para ver a este usuario.')
    }
    res.json(user)
  }),

  // Alta de un usuario con el rol indicado (la usará el administrador).
  create: asyncHandler(async (req, res) => {
    const data = validate(req.body, {
      ...userRules,
      password: passwordRule,
      rol: { ...roleRule, default: 'estudiante' }
    })
    const user = await UserModel.create({
      nombre: data.nombre,
      correo: data.correo,
      password_hash: await hashPassword(data.password),
      rol: data.rol,
      programa: data.programa
    })
    res.status(201).json(user)
  }),

  // PUT: reemplaza nombre, correo y programa. Si no se envían rol o activo, se conservan.
  update: asyncHandler(async (req, res) => {
    const user = await findOrFail(req.params.id)
    if (!isAdmin(req.user) && user.id !== req.user.id) {
      throw forbidden('Solo puedes editar tu propio perfil.')
    }
    const data = validate(req.body, {
      ...userRules,
      rol: roleRule,
      activo: { type: 'boolean', label: 'El estado de la cuenta' }
    })
    const merged = {
      ...data,
      rol: data.rol ?? user.rol,
      activo: data.activo ?? Boolean(user.activo)
    }
    // Quien edita su propio perfil no puede cambiarse el rol ni reactivar/desactivar su cuenta.
    if (!isAdmin(req.user) && (merged.rol !== user.rol || merged.activo !== Boolean(user.activo))) {
      throw forbidden('Solo un administrador puede cambiar el rol o el estado de una cuenta.', 'FORBIDDEN_FIELD')
    }
    await assertNotLastAdmin(user, { willBeAdmin: merged.rol === 'admin', willBeActive: merged.activo })
    res.json(await UserModel.update(user.id, merged))
  }),

  remove: asyncHandler(async (req, res) => {
    const user = await findOrFail(req.params.id)
    await assertNotLastAdmin(user, { willBeAdmin: false, willBeActive: false })
    await UserModel.remove(user.id)
    res.status(204).send()
  })
}
