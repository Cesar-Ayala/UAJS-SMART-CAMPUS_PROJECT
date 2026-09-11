import express from 'express'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkConnection } from '../../shared/db.js'
import requestRoutes from './src/routes/requestRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const app = express()
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'requests-service' })
})

app.use('/api/requests', requestRoutes)

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada en requests-service.' }))

const PORT = process.env.REQUESTS_PORT || 4002

app.listen(PORT, async () => {
  console.log(`📄 requests-service escuchando en http://localhost:${PORT}`)
  await checkConnection('requests-service')
})
