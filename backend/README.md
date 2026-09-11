# UAJS Smart Campus — Backend (Arquitectura de Microservicios)

**Arquitectura:** Frontend React → API Gateway → Microservicios → MySQL

```text
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

El frontend únicamente tiene comunicación con el **API Gateway** (`http://localhost:4000/api`). El Gateway se encarga de reenviar cada petición al microservicio correspondiente según el prefijo de la ruta:

| Ruta pública           | Microservicio         |
| ---------------------- | --------------------- |
| `/api/users/*`         | users-service         |
| `/api/requests/*`      | requests-service      |
| `/api/reservations/*`  | reservations-service  |
| `/api/resources/*`     | resources-service     |
| `/api/events/*`        | events-service        |
| `/api/notifications/*` | notifications-service |

## Cómo arrancar todo (un solo comando)

### 1. Base de datos

La base de datos se inicializa mediante el siguiente comando:

```bash
mysql -u root uajs_smart_campus < database/schema.sql
```

### 2. Variables de entorno

Se debe crear el archivo `.env` a partir del archivo de ejemplo:

```bash
cp .env.example .env
```

Posteriormente, se configuran las credenciales de MySQL en caso de utilizar una configuración diferente a XAMPP sin contraseña.

### 3. Instalación de todas las dependencias

Gracias al uso de **npm workspaces**, las dependencias del API Gateway y de los seis microservicios pueden instalarse desde la carpeta principal `backend/` mediante un único comando:

```bash
npm install
```

### 4. Inicio del Gateway y los microservicios

El Gateway y los seis microservicios pueden ejecutarse simultáneamente mediante:

```bash
npm run dev
```

Los registros de ejecución de los siete procesos se muestran en una misma terminal, utilizando colores diferentes para facilitar la identificación de cada servicio. Cada microservicio establece su propia conexión con MySQL.

### 5. Verificación del funcionamiento

El funcionamiento de cada componente puede comprobarse mediante las siguientes rutas:

* `http://localhost:4000/api/health` → health del API Gateway
* `http://localhost:4001/health` → health de users-service
* `http://localhost:4002/health` → health de requests-service
* `http://localhost:4003/health` → health de reservations-service
* `http://localhost:4004/health` → health de resources-service
* `http://localhost:4005/health` → health de events-service
* `http://localhost:4006/health` → health de notifications-service

Para comprobar la integración completa a través del API Gateway, se puede realizar una petición a:

```text
http://localhost:4000/api/requests
```

La respuesta debe coincidir con la obtenida directamente desde:

```text
http://localhost:4002/api/requests
```

Esto permite verificar que el API Gateway está realizando correctamente el reenvío de las peticiones hacia el microservicio correspondiente.

## Notas técnicas

* Actualmente, todos los microservicios utilizan la misma base de datos MySQL (`uajs_smart_campus`).
* Cada microservicio mantiene su propia ejecución y establece de manera independiente la conexión con la base de datos.
* El API Gateway funciona como punto de entrada único para las solicitudes provenientes del frontend.
* La autenticación de usuarios se implementa mediante **JWT (JSON Web Token)**.

  Cada uno solo toca las tablas de su dominio (principio de responsabilidad única a nivel de código,
  aunque la infraestructura de datos se separará más adelante).
- La autenticación (JWT) vive dentro de `users-service`, bajo `/api/users/auth/*`.
- El frontend nunca llama a un microservicio directamente: siempre pasa por el Gateway.
