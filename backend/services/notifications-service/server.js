import express from 'express'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkConnection } from '../../shared/db.js'
import notificationRoutes from './src/routes/notificationRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const app = express()
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notifications-service' })
})

app.use('/api/notifications', notificationRoutes)

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada en notifications-service.' }))

const PORT = process.env.NOTIFICATIONS_PORT || 4006

app.listen(PORT, async () => {
  console.log(`🔔 notifications-service escuchando en http://localhost:${PORT}`)
  await checkConnection('notifications-service')
})
