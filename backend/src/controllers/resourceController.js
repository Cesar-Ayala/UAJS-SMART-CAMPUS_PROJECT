import { ResourceModel } from '../models/resourceModel.js'

export const ResourceController = {
  async list(req, res) {
    try {
      const resources = await ResourceModel.findAll()
      res.json(resources)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar recursos.', error: error.message })
    }
  },

  async updateAvailability(req, res) {
    try {
      await ResourceModel.setAvailability(req.params.id, req.body.disponible)
      res.json({ message: 'Disponibilidad actualizada.' })
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar disponibilidad.', error: error.message })
    }
  }
}
