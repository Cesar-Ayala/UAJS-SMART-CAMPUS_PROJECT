import { pool } from '../../../../shared/db.js'

const COLUMNS = 'id, codigo, nombre, tipo, ubicacion, descripcion, estado, disponible'

export const ResourceModel = {
  async findAll({ tipo, estado, disponible } = {}) {
    const where = []
    const params = []
    if (tipo) { where.push('tipo = ?'); params.push(tipo) }
    if (estado) { where.push('estado = ?'); params.push(estado) }
    if (disponible !== null && disponible !== undefined) { where.push('disponible = ?'); params.push(disponible) }

    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM recursos ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY nombre`,
      params
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM recursos WHERE id = ?`, [id])
    return rows[0] || null
  },

  async create({ codigo, nombre, tipo, ubicacion, descripcion, estado, disponible }) {
    const [result] = await pool.query(
      `INSERT INTO recursos (codigo, nombre, tipo, ubicacion, descripcion, estado, disponible)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [codigo, nombre, tipo, ubicacion, descripcion, estado, disponible]
    )
    return this.findById(result.insertId)
  },

  async update(id, { codigo, nombre, tipo, ubicacion, descripcion, estado, disponible }) {
    await pool.query(
      `UPDATE recursos
       SET codigo = ?, nombre = ?, tipo = ?, ubicacion = ?, descripcion = ?, estado = ?, disponible = ?
       WHERE id = ?`,
      [codigo, nombre, tipo, ubicacion, descripcion, estado, disponible, id]
    )
    return this.findById(id)
  },

  async setAvailability(id, disponible) {
    await pool.query('UPDATE recursos SET disponible = ? WHERE id = ?', [disponible, id])
    return this.findById(id)
  },

  async remove(id) {
    await pool.query('DELETE FROM recursos WHERE id = ?', [id])
  }
}
