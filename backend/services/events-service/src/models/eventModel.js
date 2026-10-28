import { pool } from '../../../../shared/db.js'

const COLUMNS = 'id, nombre, fecha, hora, hora_fin, lugar, descripcion, estado, creado_por'

export const EventModel = {
  async findAll({ estado } = {}) {
    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM eventos ${estado ? 'WHERE estado = ?' : ''} ORDER BY fecha ASC, id ASC`,
      estado ? [estado] : []
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM eventos WHERE id = ?`, [id])
    return rows[0] || null
  },

  async create({ nombre, fecha, hora, hora_fin, lugar, descripcion, estado, creado_por }) {
    const [result] = await pool.query(
      `INSERT INTO eventos (nombre, fecha, hora, hora_fin, lugar, descripcion, estado, creado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, fecha, hora, hora_fin, lugar, descripcion, estado, creado_por]
    )
    return this.findById(result.insertId)
  },

  async update(id, { nombre, fecha, hora, hora_fin, lugar, descripcion, estado }) {
    await pool.query(
      `UPDATE eventos
       SET nombre = ?, fecha = ?, hora = ?, hora_fin = ?, lugar = ?, descripcion = ?, estado = ?
       WHERE id = ?`,
      [nombre, fecha, hora, hora_fin, lugar, descripcion, estado, id]
    )
    return this.findById(id)
  },

  async remove(id) {
    await pool.query('DELETE FROM eventos WHERE id = ?', [id])
  }
}
