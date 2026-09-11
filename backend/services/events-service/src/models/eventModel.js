import { pool } from '../../../../shared/db.js'

export const EventModel = {
  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, nombre, fecha, hora, lugar, descripcion FROM eventos ORDER BY fecha ASC'
    )
    return rows
  },

  async create(event) {
    const { nombre, fecha, hora, lugar, descripcion } = event
    const [result] = await pool.query(
      `INSERT INTO eventos (nombre, fecha, hora, lugar, descripcion) VALUES (?, ?, ?, ?, ?)`,
      [nombre, fecha, hora, lugar, descripcion]
    )
    return { id: result.insertId, ...event }
  },

  async remove(id) {
    await pool.query('DELETE FROM eventos WHERE id = ?', [id])
  }
}
