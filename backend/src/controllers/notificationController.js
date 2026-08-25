import { NotificationModel } from '../models/notificationModel.js'

export const NotificationController = {
  async listByUser(req, res) {
    try {
      const usuarioId = req.params.usuarioId
      const notifications = await NotificationModel.findByUser(usuarioId)
      res.json(notifications)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar notificaciones.', error: error.message })
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
