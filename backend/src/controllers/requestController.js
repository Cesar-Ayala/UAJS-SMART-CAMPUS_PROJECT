import { RequestModel } from '../models/requestModel.js'

export const RequestController = {
  async list(req, res) {
    try {
      const requests = await RequestModel.findAll()
      res.json(requests)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar solicitudes.', error: error.message })
    }
  },

  async getById(req, res) {
    try {
      const request = await RequestModel.findById(req.params.id)
      if (!request) return res.status(404).json({ message: 'Solicitud no encontrada.' })
      res.json(request)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar la solicitud.', error: error.message })
    }
  },

  async create(req, res) {
    try {
      const request = await RequestModel.create(req.body)
      res.status(201).json(request)
    } catch (error) {
      res.status(400).json({ message: 'Error al crear la solicitud.', error: error.message })
    }
  },

  async updateStatus(req, res) {
    try {
      const request = await RequestModel.updateStatus(req.params.id, req.body.estado)
      res.json(request)
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar el estado.', error: error.message })
    }
  },

  async remove(req, res) {
    try {
      await RequestModel.remove(req.params.id)
      res.status(204).send()
    } catch (error) {
      res.status(400).json({ message: 'Error al eliminar la solicitud.', error: error.message })
    }
  }
}
