import { pool } from '../../../../shared/db.js'

export const NotificationModel = {
  // Lista todas las notificaciones (para el checkpoint; en el Entregable 2
  // se filtrará por el usuario autenticado desde el JWT).
  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, usuario_id, mensaje, fecha, leida FROM notificaciones ORDER BY fecha DESC'
    )
    return rows
  },

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
    const [result] = await pool.query(
      `INSERT INTO notificaciones (usuario_id, mensaje, leida, fecha) VALUES (?, ?, FALSE, NOW())`,
      [usuario_id, mensaje]
    )
    const [rows] = await pool.query('SELECT * FROM notificaciones WHERE id = ?', [result.insertId])
    return rows[0]
  }
}
