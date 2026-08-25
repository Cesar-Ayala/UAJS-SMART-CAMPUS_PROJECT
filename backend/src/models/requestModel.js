import { pool } from '../config/db.js'

export const RequestModel = {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT id, tipo, dependencia, fecha, descripcion, prioridad, estado, responsable
       FROM solicitudes ORDER BY fecha DESC`
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM solicitudes WHERE id = ?', [id])
    return rows[0] || null
  },

  async create({ tipo, dependencia, descripcion, usuario_id, prioridad = 'media' }) {
    const [result] = await pool.query(
      `INSERT INTO solicitudes (tipo, dependencia, descripcion, usuario_id, prioridad, estado, fecha)
       VALUES (?, ?, ?, ?, ?, 'Registrada', NOW())`,
      [tipo, dependencia, descripcion, usuario_id, prioridad]
    )
    return this.findById(result.insertId)
  },

  async updateStatus(id, estado) {
    await pool.query('UPDATE solicitudes SET estado = ? WHERE id = ?', [estado, id])
    return this.findById(id)
  },

  async remove(id) {
    await pool.query('DELETE FROM solicitudes WHERE id = ?', [id])
  }
}
