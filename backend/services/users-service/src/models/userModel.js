import { pool } from '../../../../shared/db.js'

const PUBLIC_COLUMNS = 'id, nombre, correo, rol, programa, activo'

export const UserModel = {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT ${PUBLIC_COLUMNS}, creado_en FROM usuarios ORDER BY nombre`
    )
    return rows
  },

  // Incluye password_hash: solo para uso interno del login. Nunca se envía al cliente.
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [email])
    return rows[0] || null
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT ${PUBLIC_COLUMNS} FROM usuarios WHERE id = ?`, [id])
    return rows[0] || null
  },

  async create({ nombre, correo, password_hash, rol = 'estudiante', programa }) {
    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol, programa) VALUES (?, ?, ?, ?, ?)`,
      [nombre, correo, password_hash, rol, programa]
    )
    return this.findById(result.insertId)
  },

  async update(id, { nombre, correo, programa, rol, activo }) {
    await pool.query(
      'UPDATE usuarios SET nombre = ?, correo = ?, programa = ?, rol = ?, activo = ? WHERE id = ?',
      [nombre, correo, programa, rol, activo, id]
    )
    return this.findById(id)
  },

  // Cuántos administradores con la cuenta activa hay (para no dejar el sistema sin ninguno).
  async countActiveAdmins() {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'admin' AND activo = TRUE"
    )
    return rows[0].total
  },

  async remove(id) {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id])
  }
}
