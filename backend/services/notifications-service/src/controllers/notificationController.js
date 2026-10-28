import { NotificationModel } from '../models/notificationModel.js'
import { asyncHandler } from '../../../../shared/http.js'
import { forbidden, notFound } from '../../../../shared/errors.js'
import { isAdmin, isService } from '../../../../shared/auth.js'
import { parseId, validate } from '../../../../shared/validate.js'

const TIPOS = ['solicitud', 'reserva', 'evento', 'sistema']

const filterRules = {
  usuario_id: { type: 'int', min: 1, label: 'El usuario' },
  leida: { type: 'boolean', label: 'El estado de lectura' },
  tipo: { type: 'enum', values: TIPOS, label: 'El tipo' }
}

const createRules = {
  usuario_id: { type: 'int', min: 1, required: true, label: 'El destinatario' },
  titulo: { type: 'string', maxLength: 150, default: 'Notificación', label: 'El título' },
  mensaje: { type: 'string', required: true, maxLength: 255, label: 'El mensaje' },
  tipo: { type: 'enum', values: TIPOS, default: 'sistema', label: 'El tipo' },
  entidad: { type: 'string', maxLength: 30, label: 'La entidad relacionada' },
  entidad_id: { type: 'int', min: 1, label: 'El identificador de la entidad relacionada' }
}

const updateRules = {
  titulo: { type: 'string', required: true, maxLength: 150, label: 'El título' },
  mensaje: createRules.mensaje
}

// Todos (incluido el personal administrativo) ven solo SUS notificaciones; únicamente el admin
// y los servicios internos ven las de todos.
const onlyOwn = (user) => !isAdmin(user) && !isService(user)

async function findOrFail(idParam) {
  const notification = await NotificationModel.findById(parseId(idParam))
  if (!notification) throw notFound('Notificación no encontrada.', 'NOTIFICATION_NOT_FOUND')
  return notification
}

export const NotificationController = {
  list: asyncHandler(async (req, res) => {
    const filters = validate(req.query, filterRules)
    if (onlyOwn(req.user)) filters.usuario_id = req.user.id
    res.json(await NotificationModel.findAll(filters))
  }),

  listByUser: asyncHandler(async (req, res) => {
    const filters = validate(req.query, { leida: filterRules.leida })
    const usuarioId = parseId(req.params.usuarioId)
    if (onlyOwn(req.user) && usuarioId !== req.user.id) {
      throw forbidden('Solo puedes ver tus propias notificaciones.')
    }
    res.json(await NotificationModel.findAll({ ...filters, usuario_id: usuarioId }))
  }),

  getById: asyncHandler(async (req, res) => {
    const notification = await findOrFail(req.params.id)
    if (onlyOwn(req.user) && notification.usuario_id !== req.user.id) {
      throw forbidden('No tienes permiso para ver esta notificación.')
    }
    res.json(notification)
  }),

  create: asyncHandler(async (req, res) => {
    const data = validate(req.body, createRules)
    res.status(201).json(await NotificationModel.create(data))
  }),

  update: asyncHandler(async (req, res) => {
    const notification = await findOrFail(req.params.id)
    const data = validate(req.body, updateRules)
    res.json(await NotificationModel.update(notification.id, data))
  }),

  markAsRead: asyncHandler(async (req, res) => {
    const notification = await findOrFail(req.params.id)
    if (onlyOwn(req.user) && notification.usuario_id !== req.user.id) {
      throw forbidden('Solo puedes marcar como leídas tus propias notificaciones.')
    }
    res.json(await NotificationModel.markAsRead(notification.id))
  }),

  remove: asyncHandler(async (req, res) => {
    const notification = await findOrFail(req.params.id)
    await NotificationModel.remove(notification.id)
    res.status(204).send()
  })
}
