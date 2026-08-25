import { pool } from '../config/db.js'

export const ReservationModel = {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT r.id, r.fecha, r.hora, r.estado, rec.nombre AS recurso
       FROM reservas r JOIN recursos rec ON rec.id = r.recurso_id
       ORDER BY r.fecha DESC`
    )
    return rows
  },

  async create({ recurso_id, usuario_id, fecha, hora }) {
    const [result] = await pool.query(
      `INSERT INTO reservas (recurso_id, usuario_id, fecha, hora, estado)
       VALUES (?, ?, ?, ?, 'Pendiente')`,
      [recurso_id, usuario_id, fecha, hora]
    )
    const [rows] = await pool.query('SELECT * FROM reservas WHERE id = ?', [result.insertId])
    return rows[0]
  },

  async updateStatus(id, estado) {
    await pool.query('UPDATE reservas SET estado = ? WHERE id = ?', [estado, id])
  }
}
