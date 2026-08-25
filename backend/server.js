import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { checkConnection } from './src/config/db.js'
import authRoutes from './src/routes/authRoutes.js'
import serviceRoutes from './src/routes/serviceRoutes.js'
import requestRoutes from './src/routes/requestRoutes.js'
import reservationRoutes from './src/routes/reservationRoutes.js'
import resourceRoutes from './src/routes/resourceRoutes.js'
import eventRoutes from './src/routes/eventRoutes.js'
import notificationRoutes from './src/routes/notificationRoutes.js'

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'uajs-smart-campus-backend' }))

app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/notifications', notificationRoutes)

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada.' }))

const PORT = process.env.PORT || 4000

app.listen(PORT, async () => {
  console.log(`🚀 UAJS Smart Campus backend escuchando en http://localhost:${PORT}`)
  await checkConnection()
})
