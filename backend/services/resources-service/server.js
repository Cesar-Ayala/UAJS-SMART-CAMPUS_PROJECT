import express from 'express'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkConnection } from '../../shared/db.js'
import resourceRoutes from './src/routes/resourceRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const app = express()
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'resources-service' })
})

app.use('/api/resources', resourceRoutes)

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada en resources-service.' }))

const PORT = process.env.RESOURCES_PORT || 4004

app.listen(PORT, async () => {
  console.log(`🧰 resources-service escuchando en http://localhost:${PORT}`)
  await checkConnection('resources-service')
})
