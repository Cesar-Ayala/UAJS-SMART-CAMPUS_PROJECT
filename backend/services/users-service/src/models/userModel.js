import { pool } from '../../../../shared/db.js'

export const UserModel = {
  async findAll() {
    const [rows] = await pool.query(
      'SELECT id, nombre, correo, rol, programa, creado_en FROM usuarios ORDER BY nombre'
    )
    return rows
  },

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
  },

  async update(id, { nombre, programa }) {
    await pool.query('UPDATE usuarios SET nombre = ?, programa = ? WHERE id = ?', [
      nombre,
      programa,
      id
    ])
    return this.findById(id)
  },

  async remove(id) {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id])
  }
}
