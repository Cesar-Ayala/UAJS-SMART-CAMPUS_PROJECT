import { pool } from '../../../../shared/db.js'

// Nota: el JOIN con 'recursos' es una excepción conocida a la propiedad de los datos
// por servicio (ver backend/database/README.md).
const SELECT = `SELECT r.id, r.recurso_id, r.usuario_id, r.fecha, r.hora, r.proposito, r.estado,
                       rec.nombre AS recurso
                FROM reservas r JOIN recursos rec ON rec.id = r.recurso_id`

export const ReservationModel = {
  async findAll({ usuario_id, recurso_id, estado } = {}) {
    const where = []
    const params = []
    if (usuario_id) { where.push('r.usuario_id = ?'); params.push(usuario_id) }
    if (recurso_id) { where.push('r.recurso_id = ?'); params.push(recurso_id) }
    if (estado) { where.push('r.estado = ?'); params.push(estado) }

    const [rows] = await pool.query(
      `${SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY r.fecha DESC, r.id DESC`,
      params
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query(`${SELECT} WHERE r.id = ?`, [id])
    return rows[0] || null
  },

  async create({ recurso_id, usuario_id, fecha, hora, proposito }) {
    const [result] = await pool.query(
      `INSERT INTO reservas (recurso_id, usuario_id, fecha, hora, proposito, estado)
       VALUES (?, ?, ?, ?, ?, 'Pendiente')`,
      [recurso_id, usuario_id, fecha, hora, proposito]
    )
    return this.findById(result.insertId)
  },

  async update(id, { fecha, hora, proposito }) {
    await pool.query('UPDATE reservas SET fecha = ?, hora = ?, proposito = ? WHERE id = ?', [
      fecha,
      hora,
      proposito,
      id
    ])
    return this.findById(id)
  },

  async updateStatus(id, estado) {
    // 'activa' es NULL cuando la reserva se cancela: así la franja queda libre
    // (ver la restricción uq_reserva_franja en schema.sql).
    await pool.query('UPDATE reservas SET estado = ?, activa = ? WHERE id = ?', [
      estado,
      estado === 'Cancelada' ? null : 1,
      id
    ])
    return this.findById(id)
  },

  async remove(id) {
    await pool.query('DELETE FROM reservas WHERE id = ?', [id])
  }
}
