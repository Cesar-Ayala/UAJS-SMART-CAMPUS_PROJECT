import { EventModel } from '../models/eventModel.js'

export const EventController = {
  async list(req, res) {
    try {
      const events = await EventModel.findAll()
      res.json(events)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar eventos.', error: error.message })
    }
  },

  async create(req, res) {
    try {
      const event = await EventModel.create(req.body)
      res.status(201).json(event)
    } catch (error) {
      res.status(400).json({ message: 'Error al crear el evento.', error: error.message })
    }
  }
}
