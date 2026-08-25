import { pool } from '../config/db.js'

export const NotificationModel = {
  async findByUser(usuario_id) {
    const [rows] = await pool.query(
      `SELECT id, mensaje, fecha, leida FROM notificaciones
       WHERE usuario_id = ? ORDER BY fecha DESC`,
      [usuario_id]
    )
    return rows
  },

  async markAsRead(id) {
    await pool.query('UPDATE notificaciones SET leida = TRUE WHERE id = ?', [id])
  },

  async create({ usuario_id, mensaje }) {
    await pool.query(
      `INSERT INTO notificaciones (usuario_id, mensaje, leida, fecha) VALUES (?, ?, FALSE, NOW())`,
      [usuario_id, mensaje]
    )
  }
}
