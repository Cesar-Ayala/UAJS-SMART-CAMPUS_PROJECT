import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createProxyMiddleware } from 'http-proxy-middleware'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config({
  path: path.resolve(__dirname, '../.env')
})

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
)

// =====================================================
// MAPA DE MICROSERVICIOS
// =====================================================

const SERVICES = {
  '/api/users': `http://localhost:${process.env.USERS_PORT || 4001}`,
  '/api/requests': `http://localhost:${process.env.REQUESTS_PORT || 4002}`,
  '/api/reservations': `http://localhost:${process.env.RESERVATIONS_PORT || 4003}`,
  '/api/resources': `http://localhost:${process.env.RESOURCES_PORT || 4004}`,
  '/api/events': `http://localhost:${process.env.EVENTS_PORT || 4005}`,
  '/api/notifications': `http://localhost:${process.env.NOTIFICATIONS_PORT || 4006}`
}

// =====================================================
// PROXY HACIA LOS MICROSERVICIOS
// =====================================================

Object.entries(SERVICES).forEach(([routePrefix, target]) => {
  app.use(
    routePrefix,
    createProxyMiddleware({
      target,
      changeOrigin: true,

      // Express elimina el prefijo al montar el middleware.
      // Lo volvemos a agregar para que el microservicio
      // reciba la ruta completa.
      pathRewrite: (path) => `${routePrefix}${path}`,

      on: {
        proxyReq: (proxyReq, req) => {
          console.log(
            `[gateway] ${req.method} ${req.originalUrl} -> ${target}${req.url}`
          )
        },

        error: (err, req, res) => {
          console.error(
            `[gateway] Error contactando ${target}:`,
            err.message
          )

          if (!res.headersSent) {
            res.status(502).json({
              message: `El servicio detrás de ${routePrefix} no responde.`
            })
          }
        }
      }
    })
  )
})

// =====================================================
// HEALTH CHECK DEL GATEWAY
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway',
    routes: Object.keys(SERVICES)
  })
})

// =====================================================
// RUTA NO ENCONTRADA
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no reconocida por el API Gateway.'
  })
})

// =====================================================
// INICIAR GATEWAY
// =====================================================

const PORT = process.env.GATEWAY_PORT || 4000

app.listen(PORT, () => {
  console.log(
    `API Gateway escuchando en http://localhost:${PORT}`
  )

  console.log(
    'Rutas registradas:',
    Object.keys(SERVICES).join(', ')
  )
})