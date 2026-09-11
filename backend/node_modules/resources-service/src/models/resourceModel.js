import { pool } from '../../../../shared/db.js'

export const ResourceModel = {
  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, codigo, nombre, tipo, ubicacion, estado, disponible FROM recursos ORDER BY nombre'
    )
    return rows
  },

  async create({ codigo, nombre, tipo, ubicacion }) {
    const [result] = await pool.query(
      `INSERT INTO recursos (codigo, nombre, tipo, ubicacion, disponible) VALUES (?, ?, ?, ?, TRUE)`,
      [codigo, nombre, tipo, ubicacion]
    )
    const [rows] = await pool.query('SELECT * FROM recursos WHERE id = ?', [result.insertId])
    return rows[0]
  },

  async setAvailability(id, disponible) {
    await pool.query('UPDATE recursos SET disponible = ? WHERE id = ?', [disponible, id])
  },

  async remove(id) {
    await pool.query('DELETE FROM recursos WHERE id = ?', [id])
  }
}
