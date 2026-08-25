import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'uajs_smart_campus',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export async function checkConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Conexión a MySQL establecida correctamente.')
    connection.release()
  } catch (error) {
    console.error('❌ No se pudo conectar a MySQL:', error.message)
  }
}
