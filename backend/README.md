# UAJS Smart Campus — Backend (Arquitectura de Microservicios)

Arquitectura: **Frontend React → API Gateway → Microservicios → MySQL**

```
backend/
├── api-gateway/              # Punto de entrada único (puerto 4000)
├── services/
│   ├── users-service/        # puerto 4001 — usuarios + autenticación (JWT)
│   ├── requests-service/     # puerto 4002 — solicitudes
│   ├── reservations-service/ # puerto 4003 — reservas
│   ├── resources-service/    # puerto 4004 — recursos
│   ├── events-service/       # puerto 4005 — eventos
│   └── notifications-service/# puerto 4006 — notificaciones
├── shared/db.js              # Conexión MySQL compartida (pool)
├── database/schema.sql       # Esquema + datos de prueba
├── docker/                   # (Entregable 3)
└── .env                      # Variables de entorno de TODOS los servicios
```

El frontend **solo conoce el API Gateway** (`http://localhost:4000/api`). El Gateway reenvía
cada petición al microservicio correspondiente según el prefijo de la ruta:

| Ruta pública | Microservicio |
|---|---|
| `/api/users/*` | users-service |
| `/api/requests/*` | requests-service |
| `/api/reservations/*` | reservations-service |
| `/api/resources/*` | resources-service |
| `/api/events/*` | events-service |
| `/api/notifications/*` | notifications-service |

## Cómo arrancar todo (un solo comando)

### 1. Base de datos

```bash
mysql -u root uajs_smart_campus < database/schema.sql
```

### 2. Variables de entorno

```bash
cp .env.example .env
# edita .env con tus credenciales de MySQL si no usas XAMPP sin contraseña
```

### 3. Instalar TODAS las dependencias (gateway + los 6 microservicios) de una vez

Gracias a **npm workspaces**, un solo `npm install` en esta carpeta (`backend/`) instala las
dependencias de cada microservicio automáticamente:

```bash
npm install
```

### 4. Arrancar el Gateway + los 6 microservicios juntos

```bash
npm run dev
```

Vas a ver en una sola terminal, con colores distintos por servicio, los logs de los 7 procesos
arrancando a la vez (Gateway + 6 microservicios). Cada uno se conecta a MySQL de forma
independiente.

### 5. Verificar que todo esté vivo

Abre en el navegador (o usa Postman):

- `http://localhost:4000/api/health` → salud del Gateway
- `http://localhost:4001/health` → salud de users-service
- `http://localhost:4002/health` → salud de requests-service
- `http://localhost:4003/health` → salud de reservations-service
- `http://localhost:4004/health` → salud de resources-service
- `http://localhost:4005/health` → salud de events-service
- `http://localhost:4006/health` → salud de notifications-service

Y para probar una integración completa a través del Gateway:

- `http://localhost:4000/api/requests` → debe responder lo mismo que `http://localhost:4002/api/requests` directamente, confirmando que el Gateway está reenviando correctamente.

## Notas técnicas

- Todos los microservicios comparten por ahora la misma base de datos MySQL (`uajs_smart_campus`).
  Cada uno solo toca las tablas de su dominio (principio de responsabilidad única a nivel de código,
  aunque la infraestructura de datos se separará más adelante).
- La autenticación (JWT) vive dentro de `users-service`, bajo `/api/users/auth/*`.
- El frontend nunca llama a un microservicio directamente: siempre pasa por el Gateway.
