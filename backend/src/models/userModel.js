import { pool } from '../config/db.js'

export const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [email])
    return rows[0] || null
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, nombre, correo, rol, programa FROM usuarios WHERE id = ?',
      [id]
    )
    return rows[0] || null
  },

  async create({ nombre, correo, password_hash, rol = 'estudiante', programa }) {
    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol, programa) VALUES (?, ?, ?, ?, ?)`,
      [nombre, correo, password_hash, rol, programa]
    )
    return this.findById(result.insertId)
  }
}
