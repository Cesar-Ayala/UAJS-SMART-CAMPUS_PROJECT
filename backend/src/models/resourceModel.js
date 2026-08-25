import { pool } from '../config/db.js'

export const ResourceModel = {
  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, codigo, nombre, tipo, ubicacion, estado, disponible FROM recursos ORDER BY nombre'
    )
    return rows
  },

  async setAvailability(id, disponible) {
    await pool.query('UPDATE recursos SET disponible = ? WHERE id = ?', [disponible, id])
  }
}
