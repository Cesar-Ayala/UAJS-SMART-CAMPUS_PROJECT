import express from 'express'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkConnection } from '../../shared/db.js'
import eventRoutes from './src/routes/eventRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const app = express()
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'events-service' })
})

app.use('/api/events', eventRoutes)

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada en events-service.' }))

const PORT = process.env.EVENTS_PORT || 4005

app.listen(PORT, async () => {
  console.log(`🎓 events-service escuchando en http://localhost:${PORT}`)
  await checkConnection('events-service')
})
