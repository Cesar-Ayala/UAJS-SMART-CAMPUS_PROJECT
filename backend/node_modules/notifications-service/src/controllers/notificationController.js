import { NotificationModel } from '../models/notificationModel.js'

export const NotificationController = {
  async list(req, res) {
    try {
      const notifications = await NotificationModel.findAll()
      res.json(notifications)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar notificaciones.', error: error.message })
    }
  },

  async listByUser(req, res) {
    try {
      const notifications = await NotificationModel.findByUser(req.params.usuarioId)
      res.json(notifications)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar notificaciones.', error: error.message })
    }
  },

  async create(req, res) {
    try {
      const notification = await NotificationModel.create(req.body)
      res.status(201).json(notification)
    } catch (error) {
      res.status(400).json({ message: 'Error al crear la notificación.', error: error.message })
    }
  },

  async markAsRead(req, res) {
    try {
      await NotificationModel.markAsRead(req.params.id)
      res.json({ message: 'Notificación marcada como leída.' })
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar la notificación.', error: error.message })
    }
  }
}
