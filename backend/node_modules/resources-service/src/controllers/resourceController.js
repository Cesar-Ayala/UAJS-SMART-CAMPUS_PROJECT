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

  async create(req, res) {
    try {
      const resource = await ResourceModel.create(req.body)
      res.status(201).json(resource)
    } catch (error) {
      res.status(400).json({ message: 'Error al crear el recurso.', error: error.message })
    }
  },

  async updateAvailability(req, res) {
    try {
      await ResourceModel.setAvailability(req.params.id, req.body.disponible)
      res.json({ message: 'Disponibilidad actualizada.' })
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar disponibilidad.', error: error.message })
    }
  },

  async remove(req, res) {
    try {
      await ResourceModel.remove(req.params.id)
      res.status(204).send()
    } catch (error) {
      res.status(400).json({ message: 'Error al eliminar el recurso.', error: error.message })
    }
  }
}
