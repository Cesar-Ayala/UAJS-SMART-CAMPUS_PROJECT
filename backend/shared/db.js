import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Todos los microservicios comparten un único archivo .env en la raíz de backend/
dotenv.config({ path: path.resolve(__dirname, '../.env') })

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'uajs_smart_campus',
  // Las columnas DATE se devuelven como texto 'AAAA-MM-DD' y no como objetos Date:
  // así la fecha no se corre un día según la zona horaria del servidor.
  dateStrings: ['DATE'],
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export async function checkConnection(serviceName) {
  try {
    const connection = await pool.getConnection()
    console.log(`✅ [${serviceName}] Conexión a MySQL establecida correctamente.`)
    connection.release()
  } catch (error) {
    console.error(`❌ [${serviceName}] No se pudo conectar a MySQL:`, error.message)
  }
}
