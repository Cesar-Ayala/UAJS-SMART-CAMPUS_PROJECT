import { pool } from '../config/db.js'

export const ServiceModel = {
  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, nombre, categoria, descripcion FROM servicios ORDER BY nombre'
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM servicios WHERE id = ?', [id])
    return rows[0] || null
  }
}
