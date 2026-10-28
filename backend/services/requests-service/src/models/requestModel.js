import { pool } from '../../../../shared/db.js'

const COLUMNS = `id, codigo, usuario_id, tipo, dependencia, fecha, descripcion,
                 prioridad, estado, responsable, solucion`

export const RequestModel = {
  async findAll({ estado, usuario_id } = {}) {
    const where = []
    const params = []
    if (estado) { where.push('estado = ?'); params.push(estado) }
    if (usuario_id) { where.push('usuario_id = ?'); params.push(usuario_id) }

    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM solicitudes
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY fecha DESC, id DESC`,
      params
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM solicitudes WHERE id = ?`, [id])
    return rows[0] || null
  },

  // Crea la solicitud, le asigna su código (SOL-0001...) y deja constancia en el
  // historial. Todo en una transacción: o se guarda completo o no se guarda nada.
  async create({ tipo, dependencia, descripcion, usuario_id, prioridad }) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.query(
        `INSERT INTO solicitudes (tipo, dependencia, descripcion, usuario_id, prioridad, estado, fecha)
         VALUES (?, ?, ?, ?, ?, 'Registrada', NOW())`,
        [tipo, dependencia, descripcion, usuario_id, prioridad]
      )
      const id = result.insertId
      await connection.query('UPDATE solicitudes SET codigo = ? WHERE id = ?', [
        `SOL-${String(id).padStart(4, '0')}`,
        id
      ])
      await connection.query(
        `INSERT INTO solicitud_historial (solicitud_id, estado_anterior, estado_nuevo, usuario_id, comentario)
         VALUES (?, NULL, 'Registrada', ?, 'Solicitud registrada.')`,
        [id, usuario_id]
      )
      await connection.commit()
      return this.findById(id)
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  },

  // Actualiza los datos editables (no el estado: eso lo hace updateStatus).
  async update(id, { tipo, dependencia, descripcion, prioridad, responsable }) {
    await pool.query(
      `UPDATE solicitudes
       SET tipo = ?, dependencia = ?, descripcion = ?, prioridad = ?, responsable = ?
       WHERE id = ?`,
      [tipo, dependencia, descripcion, prioridad, responsable, id]
    )
    return this.findById(id)
  },

  // Cambia el estado y lo registra en el historial (misma transacción).
  async updateStatus(id, { anterior, estado, usuario_id, comentario, responsable, solucion }) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      await connection.query(
        `UPDATE solicitudes
         SET estado = ?, responsable = COALESCE(?, responsable), solucion = COALESCE(?, solucion)
         WHERE id = ?`,
        [estado, responsable, solucion, id]
      )
      await connection.query(
        `INSERT INTO solicitud_historial (solicitud_id, estado_anterior, estado_nuevo, usuario_id, comentario)
         VALUES (?, ?, ?, ?, ?)`,
        [id, anterior, estado, usuario_id, comentario || `Cambio de estado a ${estado}.`]
      )
      await connection.commit()
      return this.findById(id)
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  },

  async history(id) {
    const [rows] = await pool.query(
      `SELECT id, estado_anterior, estado_nuevo, usuario_id, comentario, fecha
       FROM solicitud_historial WHERE solicitud_id = ? ORDER BY fecha ASC, id ASC`,
      [id]
    )
    return rows
  },

  async remove(id) {
    await pool.query('DELETE FROM solicitudes WHERE id = ?', [id])
  }
}
