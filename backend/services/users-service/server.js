import express from 'express'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkConnection } from '../../shared/db.js'
import { errorHandler, notFoundHandler } from '../../shared/http.js'
import { authenticate } from '../../shared/auth.js'
import userRoutes from './src/routes/userRoutes.js'
import authRoutes from './src/routes/authRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const app = express()
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'users-service' })
})

// Montadas bajo /api/users porque así llegan reenviadas desde el API Gateway
app.use('/api/users/auth', authRoutes)
app.use('/api/users', authenticate, userRoutes)

app.use(notFoundHandler('users-service'))
app.use(errorHandler('users-service'))

const PORT = process.env.USERS_PORT || 4001

app.listen(PORT, async () => {
  console.log(`👤 users-service escuchando en http://localhost:${PORT}`)
  await checkConnection('users-service')
})
