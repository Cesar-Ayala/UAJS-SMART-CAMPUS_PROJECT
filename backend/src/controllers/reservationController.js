import { ReservationModel } from '../models/reservationModel.js'

export const ReservationController = {
  async list(req, res) {
    try {
      const reservations = await ReservationModel.findAll()
      res.json(reservations)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar reservas.', error: error.message })
    }
  },

  async create(req, res) {
    try {
      const reservation = await ReservationModel.create(req.body)
      res.status(201).json(reservation)
    } catch (error) {
      res.status(400).json({ message: 'Error al crear la reserva.', error: error.message })
    }
  },

  async updateStatus(req, res) {
    try {
      await ReservationModel.updateStatus(req.params.id, req.body.estado)
      res.json({ message: 'Estado actualizado.' })
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar la reserva.', error: error.message })
    }
  }
}
