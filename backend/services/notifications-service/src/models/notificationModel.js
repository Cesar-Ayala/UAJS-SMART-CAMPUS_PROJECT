import { pool } from '../../../../shared/db.js'

const COLUMNS = 'id, usuario_id, titulo, mensaje, tipo, entidad, entidad_id, leida, leida_en, fecha'

export const NotificationModel = {
  async findAll({ usuario_id, leida, tipo } = {}) {
    const where = []
    const params = []
    if (usuario_id) { where.push('usuario_id = ?'); params.push(usuario_id) }
    if (leida !== null && leida !== undefined) { where.push('leida = ?'); params.push(leida) }
    if (tipo) { where.push('tipo = ?'); params.push(tipo) }

    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM notificaciones
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY fecha DESC, id DESC`,
      params
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM notificaciones WHERE id = ?`, [id])
    return rows[0] || null
  },

  async create({ usuario_id, titulo, mensaje, tipo, entidad, entidad_id }) {
    const [result] = await pool.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, entidad, entidad_id, leida, fecha)
       VALUES (?, ?, ?, ?, ?, ?, FALSE, NOW())`,
      [usuario_id, titulo, mensaje, tipo, entidad, entidad_id]
    )
    return this.findById(result.insertId)
  },

  async update(id, { titulo, mensaje }) {
    await pool.query('UPDATE notificaciones SET titulo = ?, mensaje = ? WHERE id = ?', [titulo, mensaje, id])
    return this.findById(id)
  },

  // Marca como leída y guarda cuándo; si ya estaba leída conserva la fecha original.
  async markAsRead(id) {
    await pool.query(
      'UPDATE notificaciones SET leida = TRUE, leida_en = COALESCE(leida_en, NOW()) WHERE id = ?',
      [id]
    )
    return this.findById(id)
  },

  async remove(id) {
    await pool.query('DELETE FROM notificaciones WHERE id = ?', [id])
  }
}
