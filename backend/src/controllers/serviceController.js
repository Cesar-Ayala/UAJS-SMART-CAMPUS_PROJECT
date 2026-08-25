import { ServiceModel } from '../models/serviceModel.js'

export const ServiceController = {
  async list(req, res) {
    try {
      const services = await ServiceModel.findAll()
      res.json(services)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar servicios.', error: error.message })
    }
  },

  async getById(req, res) {
    try {
      const service = await ServiceModel.findById(req.params.id)
      if (!service) return res.status(404).json({ message: 'Servicio no encontrado.' })
      res.json(service)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar el servicio.', error: error.message })
    }
  }
}
