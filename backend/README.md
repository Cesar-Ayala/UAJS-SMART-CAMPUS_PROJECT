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
├── database/schema.sql       # Esquema (solo estructura)
├── database/seed.sql         # Datos de prueba ficticios
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

Se ejecutan los dos scripts, en este orden y desde la carpeta `backend/` (`-p` si el usuario `root` tiene contraseña):

```bash
mysql -u root < database/schema.sql
mysql -u root < database/seed.sql
```

> **En PowerShell** el operador `<` no existe: usa `mysql -u root -e "source database/schema.sql"` (y lo mismo con
> `seed.sql`), o importa los archivos desde phpMyAdmin. **Si la base ya existía de una versión anterior hay que
> borrarla primero** (`DROP DATABASE`); no basta con ejecutar los scripts encima. Los pasos exactos, para cada
> terminal, están en [`database/README.md`](database/README.md). Si algo falla, `node scripts/diagnostico.js`
> revisa la configuración y dice qué corregir.

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

## Roles y permisos

### Cómo funciona

- Al iniciar sesión el usuario recibe un **token JWT** (válido por 8 horas) que contiene su `id` y su `rol`.
  El frontend lo envía en la cabecera `Authorization: Bearer <token>` en cada petición.
- **Cada microservicio verifica el token por sí mismo** (`backend/shared/auth.js`); el Gateway solo reenvía la cabecera.
  Ningún servicio depende de que otro haya validado antes. Todas las rutas exigen sesión, salvo el login, el
  registro y los `/health`.
- Los microservicios se consultan entre sí con una **clave interna** derivada de `JWT_SECRET` (rol interno
  `service`). Esa clave **no** da permisos de administrador: solo sirve en los endpoints donde se permite expresamente.
- El rol y el autor **nunca se toman del cuerpo de la petición**: el usuario de una solicitud, una reserva o un
  evento es siempre el de la sesión (el personal puede registrar a nombre de otra persona).

### Matriz de permisos

| Recurso | Estudiante | Docente | Administrativo | Admin |
|---|---|---|---|---|
| **Usuarios** | Ver y editar su perfil (no su rol ni su estado) | Igual | Listar y consultar a todos | Todo, incluidos roles y altas |
| **Recursos** | Consultar | Consultar | Consultar, crear, editar y eliminar | Todo |
| **Reservas** | Crear, ver, modificar y cancelar **las propias** | Igual | Ver todas, reservar a nombre de otros, confirmar y cancelar cualquiera | Todo, y eliminar |
| **Solicitudes** | Crear y ver **las propias**; editarlas mientras estén `Registrada` | Igual | Ver todas, registrar a nombre de otros, editar, **validar, denegar** y avanzar el estado | Todo, y eliminar |
| **Eventos** | Consultar | Consultar y publicar; editar o eliminar **solo los suyos** | Consultar, crear, editar y eliminar cualquiera | Todo |
| **Notificaciones** | Ver y marcar como leídas **las propias** | Igual | Ver las propias y **crear** para otros | Todo: ver todas, editar y eliminar |

### Limitaciones conocidas (para el Entregable 3)

- El rol viaja dentro del token: si un admin cambia el rol de alguien, el cambio se aplica cuando esa persona vuelve a
  iniciar sesión (o al vencer el token).
- No hay lista de revocación: desactivar una cuenta impide nuevos inicios de sesión, pero un token ya emitido sigue
  siendo válido hasta que venza.
- Los microservicios escuchan en sus propios puertos (4001 a 4006). Se protegen con el token y la clave interna, pero
  en un despliegue real solo el Gateway debería ser accesible desde fuera (por ejemplo, con Docker no publicando esos puertos).
- `JWT_SECRET` debe cambiarse por un valor largo y secreto fuera del entorno de desarrollo; de él se deriva también la clave interna.

## Reglas de negocio

Las reglas se validan siempre en el backend (aunque React también valide), en cada servicio.

### Solicitudes (`requests-service`)

Una solicitud nace en **Registrada** y solo puede avanzar por estos pasos. Cualquier otro salto responde
`409 INVALID_TRANSITION`, no cambia nada y no genera notificaciones.

El personal **valida** una solicitud pasándola a *En revisión* o la **deniega** (*Rechazada*) indicando el motivo.
Solo se puede denegar mientras nadie haya empezado a atenderla (Registrada o En revisión).

| Estado actual | Puede pasar a | Condición |
|---|---|---|
| Registrada | En revisión (**validar**) | — |
| Registrada | Rechazada (**denegar**) | Exige el **motivo** en `comentario`. |
| En revisión | Asignada | Debe haber un **responsable** (en la petición o ya guardado). |
| En revisión | Rechazada (**denegar**) | Exige el **motivo** en `comentario`. |
| Asignada | En proceso | — |
| En proceso | Resuelta | Debe registrarse la **solución** (en la petición o ya guardada). |
| Resuelta | Cerrada | — |
| Resuelta | En proceso | **Reapertura**: exige un **comentario** con el motivo. |
| Cerrada, Rechazada | (ninguno) | Son estados **finales**: no admiten cambios ni ediciones (`REQUEST_CLOSED`). |

Cada cambio queda en el historial (`GET /api/requests/:id/historial`) y se avisa al **solicitante**,
no a quien hizo el cambio. Al denegar, el motivo se guarda también como respuesta final de la solicitud
(campo `solucion`) y el solicitante lo recibe en la notificación. La base debe tener el estado `Rechazada`:
si la creaste antes de este cambio, aplica `database/migrations/001_estado_rechazada.sql` (no borra datos).

### Reservas (`reservations-service`)

- Son franjas de **una hora**, entre **7:00 AM y 7:00 PM**, con un máximo de **90 días** de anticipación.
- No se aceptan fechas pasadas, ni horas de hoy que ya comenzaron.
- Antes de guardar, el servicio **consulta por HTTP** a Usuarios y a Recursos: el usuario debe existir y tener la
  cuenta activa, y el recurso debe existir, estar `Activo` y `disponible`. Si alguno de esos servicios no responde,
  la respuesta es un `503` y **no se crea nada**.
- Dos reservas activas del mismo recurso en la misma franja no son posibles: lo garantiza la propia base de datos
  y responde `409 RESERVATION_CONFLICT`.
- Estados: `Pendiente` → `Confirmada` → `Cancelada`, o `Pendiente` → `Cancelada`. Una reserva **cancelada es
  definitiva**: no se reactiva ni se modifica; la franja queda libre para otra reserva.

### Eventos (`events-service`)

- Título, fecha, hora y lugar son obligatorios, y la hora de fin debe ser posterior a la de inicio.
- Un evento `Programado` no puede estar en el pasado (los pasados se marcan `Finalizado`).
- Al crear un evento programado se avisa a **todos los usuarios activos**.

### Usuarios (`users-service`)

- Siempre debe quedar **al menos un administrador activo**: no se puede quitar el rol, desactivar ni eliminar al
  único (`LAST_ADMIN`).
- El registro público siempre crea estudiantes; los demás roles los asigna un administrador.

### Comunicación entre servicios

Cada servicio es dueño de sus datos y, cuando necesita información de otro dominio, se la pide por HTTP
(`backend/shared/serviceClient.js`). Las direcciones se pueden cambiar con variables de entorno (ver `.env.example`).

| Servicio | Llama a | Para qué | Si el otro servicio falla |
|---|---|---|---|
| reservations | resources, users | Validar que el recurso y el usuario existen y se pueden usar | `503`; no se crea la reserva |
| reservations | notifications | Avisar de la reserva registrada, modificada, confirmada o cancelada | La reserva se guarda igual; el aviso se omite |
| requests | notifications | Avisar del registro y de cada cambio de estado | La solicitud se guarda igual; el aviso se omite |
| events | users, notifications | Avisar a los usuarios activos de un evento nuevo | El evento se guarda igual; el aviso se omite |

La zona horaria que define "hoy" y "ahora" se configura con `APP_TIMEZONE` (por defecto `America/Bogota`).

## Convenciones de la API

Todas las rutas se consumen a través del API Gateway (`http://localhost:4000/api/...`).

### Métodos HTTP

| Método | Significado | Respuesta habitual |
|---|---|---|
| `GET /recurso` | Lista (admite filtros por query string, por ejemplo `?estado=Cerrada`). | `200` |
| `GET /recurso/:id` | Consulta un registro. | `200` / `404` |
| `POST /recurso` | Crea un registro validando el cuerpo. | `201` / `400` / `409` |
| `PUT /recurso/:id` | **Reemplaza** los campos editables del registro. Los campos opcionales que no se envían quedan vacíos, salvo `estado`, `disponible`, `rol` y `activo`, que se conservan. | `200` / `400` / `404` / `409` |
| `PATCH /recurso/:id/<accion>` | Cambia **un** aspecto concreto (`/estado`, `/disponibilidad`, `/leida`). | `200` / `400` / `404` |
| `DELETE /recurso/:id` | Elimina el registro. | `204` / `404` / `409` |

Las respuestas exitosas devuelven directamente el recurso (o la lista) en JSON; los `DELETE` no devuelven cuerpo.

### Formato de los errores

Todos los errores, de cualquier servicio, tienen la misma forma:

```json
{
  "message": "La descripción es obligatoria.",
  "code": "VALIDATION_ERROR",
  "details": [{ "field": "descripcion", "message": "La descripción es obligatoria." }]
}
```

`message` es un texto apto para mostrar al usuario; `code` es un identificador estable para el código
del cliente; `details` solo aparece en los errores de validación. **Nunca** se envían trazas, sentencias
SQL ni mensajes internos del motor de base de datos: el detalle técnico queda únicamente en el log del servidor.

| Código HTTP | `code` | Cuándo ocurre |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Faltan campos obligatorios o algún valor no es válido. |
| 400 | `INVALID_JSON` | El cuerpo de la petición no es un JSON válido. |
| 400 | `INVALID_REFERENCE` | El usuario o el recurso indicado no existe. |
| 401 | `INVALID_CREDENTIALS` | Correo o contraseña incorrectos. |
| 401 | `TOKEN_MISSING`, `TOKEN_INVALID` | Falta el token, o es falso, está alterado o venció. |
| 401 | `INTERNAL_KEY_INVALID` | Llamada directa a un microservicio con una clave interna incorrecta. |
| 403 | `FORBIDDEN` | El rol del usuario no permite esta acción, o el registro pertenece a otra persona. |
| 403 | `FORBIDDEN_FIELD` | Intentó cambiar un campo reservado (el rol o el estado de su propia cuenta). |
| 403 | `ACCOUNT_DISABLED` | La cuenta está desactivada. |
| 404 | `NOT_FOUND`, `<RECURSO>_NOT_FOUND`, `ROUTE_NOT_FOUND` | El registro o la ruta no existe. |
| 409 | `DUPLICATE_ENTRY` | Ya existe un registro con ese correo o código. |
| 409 | `RESERVATION_CONFLICT` | La franja del recurso ya está reservada. |
| 409 | `IN_USE` | No se puede eliminar porque otros datos dependen del registro. |
| 409 | `INVALID_TRANSITION` | El cambio de estado no está permitido (solicitudes y reservas). |
| 409 | `REQUEST_CLOSED` | Una solicitud cerrada no se puede modificar. |
| 409 | `RESERVATION_CANCELLED` | Una reserva cancelada no se puede modificar. |
| 409 | `RESOURCE_UNAVAILABLE` | El recurso no está activo o no está disponible para reservar. |
| 409 | `USER_DISABLED` | La cuenta del usuario está desactivada. |
| 409 | `LAST_ADMIN` | Se intentó quitar el acceso al único administrador activo. |
| 400 | `MISSING_REQUIREMENT` | El cambio de estado exige un dato que no se envió (responsable, solución o motivo). |
| 503 | `DEPENDENCY_UNAVAILABLE` | Un servicio del que depende la operación no respondió; no se guardó nada. |
| 502 | `SERVICE_UNAVAILABLE` | El Gateway no pudo contactar al microservicio. |
| 503 | `DATABASE_UNAVAILABLE` | El servicio no pudo conectarse a la base de datos. |
| 500 | `INTERNAL_ERROR` | Error inesperado del servidor. |

### Código compartido (`backend/shared/`)

- `db.js`: conexión a la base de datos. Las columnas `DATE` se devuelven como texto `AAAA-MM-DD`.
- `errors.js`: errores de aplicación (`badRequest`, `notFound`, `conflict`...).
- `http.js`: `asyncHandler` y el manejador central de errores que cada servicio registra al final.
- `validate.js`: validación y normalización de entradas; solo se aceptan los campos declarados
  (así no se puede enviar un `estado`, un `rol` o un `codigo` que el cliente no deba controlar).
