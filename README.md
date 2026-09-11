# UAJS Smart Campus

**Corporación Universitaria Antonio José de Sucre — Asignatura: Sistemas Distribuidos**
**Proyecto Integrador — Entregable 1: Diseño funcional, Frontend, Backend base y estructura de Microservicios**

Plataforma web distribuida para la gestión y articulación de servicios universitarios
(solicitudes, reservas, recursos, eventos y notificaciones) de la Corporación Universitaria
Antonio José de Sucre (UAJS).

## Integrante

| Nombre | Rol |
|---|---|
| Cesar Ayala | Arquitectura, Frontend y Microservicios |
| Willinton Benavides | Backend |



## Enlaces

- **Repositorio:** https://github.com/Cesar-Ayala/UAJS-SMART-CAMPUS_PROJECT
- **Tablero ClickUp:** https://app.clickup.com/90171490354/v/f/901710754544

## Arquitectura

```
Usuario → Frontend React → API Gateway → Microservicios → MySQL
```

El frontend se comunica únicamente con el API Gateway (puerto 4000). El Gateway reenvía
cada petición al microservicio responsable según el prefijo de la ruta:

| Ruta pública | Microservicio | Puerto |
|---|---|---|
| `/api/users/*` (incluye `/auth/*`) | users-service | 4001 |
| `/api/requests/*` | requests-service | 4002 |
| `/api/reservations/*` | reservations-service | 4003 |
| `/api/resources/*` | resources-service | 4004 |
| `/api/events/*` | events-service | 4005 |
| `/api/notifications/*` | notifications-service | 4006 |

## Estructura del repositorio

```
proyecto/
├── frontend/                  # Aplicación React (Vite)
│   └── src/
│       ├── api/client.js      # Cliente Axios (habla con el API Gateway)
│       ├── components/        # layout, common, cards, dashboard
│       ├── context/           # UserContext (sesión / JWT)
│       ├── hooks/              # useFetch (custom hook de datos)
│       ├── pages/              # Login, Home, Requests, Reservations, Events...
│       └── data/mockData.js    # Datos de respaldo si el backend no responde
│
└── backend/                   # Arquitectura de microservicios
    ├── api-gateway/           # Punto de entrada único (puerto 4000)
    ├── services/
    │   ├── users-service/         # usuarios + autenticación JWT (4001)
    │   ├── requests-service/      # solicitudes (4002)
    │   ├── reservations-service/  # reservas (4003)
    │   ├── resources-service/     # recursos (4004)
    │   ├── events-service/        # eventos (4005)
    │   └── notifications-service/ # notificaciones (4006)
    ├── shared/db.js           # Conexión MySQL compartida (pool)
    ├── database/schema.sql    # Esquema y datos de prueba
    └── docker/                # Contenerización (Entregable 3)
```

## Tecnologías

**Frontend:** React 18, Vite, React Router v6, Axios, CSS3 con metodología BEM, Context API.

**Backend:** Node.js, Express, arquitectura de microservicios, API Gateway
(`http-proxy-middleware`), JWT para autenticación, npm workspaces junto con `concurrently`
para orquestar los 7 procesos en desarrollo.

**Base de datos:** MySQL.

**Herramientas:** Git, GitHub, ClickUp, Visual Studio Code, XAMPP (MySQL local).

## Instalación y ejecución en local

### 1. Base de datos

Con MySQL en ejecución (por ejemplo, mediante XAMPP):

```bash
cd backend
mysql -u root uajs_smart_campus < database/schema.sql
```

### 2. Variables de entorno del backend

```bash
cd backend
cp .env.example .env
# Si el usuario de MySQL tiene contraseña, debe editarse en .env (DB_PASSWORD)
```

### 3. Instalación de dependencias del backend (Gateway y los 6 microservicios en un solo paso)

```bash
cd backend
npm install
```

Gracias a **npm workspaces**, este único comando instala las dependencias del API Gateway
y de los 6 microservicios.

### 4. Ejecución del backend completo (un solo comando)

```bash
npm run dev
```

Se muestran en una sola terminal, con colores distintos por proceso, los logs del Gateway
y los 6 microservicios arrancando en simultáneo.

### 5. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Cuentas de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Estudiante | estudiante@uajs.edu.co | estudiante123 |
| Docente | docente@uajs.edu.co | docente123 |
| Administrador | admin@uajs.edu.co | admin123 |

## Verificación rápida (health checks)

```
http://localhost:4000/api/health   → health del API Gateway
http://localhost:4001/health       → users-service
http://localhost:4002/health       → requests-service
http://localhost:4003/health       → reservations-service
http://localhost:4004/health       → resources-service
http://localhost:4005/health       → events-service
http://localhost:4006/health       → notifications-service
```

## Integraciones funcionales verificadas

- **Frontend → API Gateway → requests-service**: registro y consulta de solicitudes.
- **Frontend → API Gateway → reservations-service**: consulta y creación de reservas.
- Persistencia y operaciones CRUD completas sobre todos los recursos.
- Comunicación avanzada entre microservicios (mensajería asíncrona).
- Separación de bases de datos por microservicio.
- Contenerización con Docker y despliegue (Vercel / Railway / Render).
