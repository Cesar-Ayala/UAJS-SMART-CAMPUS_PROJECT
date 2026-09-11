import express from 'express'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkConnection } from '../../shared/db.js'
import reservationRoutes from './src/routes/reservationRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const app = express()
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'reservations-service' })
})

app.use('/api/reservations', reservationRoutes)

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada en reservations-service.' }))

const PORT = process.env.RESERVATIONS_PORT || 4003

app.listen(PORT, async () => {
  console.log(`📅 reservations-service escuchando en http://localhost:${PORT}`)
  await checkConnection('reservations-service')
})
