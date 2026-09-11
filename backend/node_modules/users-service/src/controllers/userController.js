import { UserModel } from '../models/userModel.js'

export const UserController = {
  async list(req, res) {
    try {
      const users = await UserModel.findAll()
      res.json(users)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar usuarios.', error: error.message })
    }
  },

  async getById(req, res) {
    try {
      const user = await UserModel.findById(req.params.id)
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' })
      res.json(user)
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar el usuario.', error: error.message })
    }
  },

  async update(req, res) {
    try {
      const user = await UserModel.update(req.params.id, req.body)
      res.json(user)
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar el usuario.', error: error.message })
    }
  },

  async remove(req, res) {
    try {
      await UserModel.remove(req.params.id)
      res.status(204).send()
    } catch (error) {
      res.status(400).json({ message: 'Error al eliminar el usuario.', error: error.message })
    }
  }
}
