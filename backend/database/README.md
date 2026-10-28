# Base de datos — UAJS Smart Campus

Motor: **MySQL / MariaDB** (probado en MariaDB 10.11; compatible con MySQL 8 y con el MariaDB de XAMPP).
Justificación: es el motor recomendado en el proyecto integrador, es relacional (las entidades tienen
relaciones claras entre sí), hace cumplir claves foráneas y restricciones, y es gratuito y fácil de instalar.

## Contenido

| Archivo | Para qué sirve |
|---|---|
| `schema.sql` | Crea la base `uajs_smart_campus` y todas las tablas (solo estructura). |
| `seed.sql` | Carga datos de prueba **ficticios**: roles, usuarios, recursos, solicitudes, reservas, eventos y notificaciones. |

## Crear la base desde cero

Desde la carpeta `backend/`. El orden importa: primero el esquema y después los datos.
`seed.sql` se ejecuta **una sola vez** sobre una base recién creada.

**Con phpMyAdmin (XAMPP):** pestaña *Importar* → sube `schema.sql` y luego `seed.sql`.

**Con terminal en Linux, macOS o CMD de Windows:**

```bash
mysql -u root < database/schema.sql
mysql -u root < database/seed.sql
```

**Con PowerShell (Windows):** PowerShell no admite el operador `<`; usa `source`. Si `mysql` no está en el
PATH, usa la ruta completa de XAMPP:

```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "source database/schema.sql"
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "source database/seed.sql"
```

Agrega `-p` si tu usuario `root` tiene contraseña.

### Recrear la base (se pierden todos los datos)

> **Importante:** no basta con volver a ejecutar los scripts encima de una base ya existente. `schema.sql`
> usa `CREATE TABLE IF NOT EXISTS`, que **no modifica** las tablas viejas, y los `INSERT` de `seed.sql`
> fallan por duplicados. El resultado es una base a medias, con las contraseñas antiguas, y el login responde
> "Credenciales inválidas". Siempre hay que **borrar la base primero**:

```bash
mysql -u root -e "DROP DATABASE IF EXISTS uajs_smart_campus"
mysql -u root < database/schema.sql
mysql -u root < database/seed.sql
```

(En PowerShell, reemplaza las dos últimas líneas por los comandos con `source` de arriba.)

`node scripts/diagnostico.js` (desde `backend/`) comprueba si la base está al día y te indica qué hacer.

### Migraciones (cambios sin borrar datos)

Si ya tienes la base creada y no quieres perder los datos, en `database/migrations/` están los cambios
posteriores como scripts que se pueden ejecutar sobre la base existente (y repetir sin riesgo):

| Script | Qué hace |
|---|---|
| `001_estado_rechazada.sql` | Agrega el estado `Rechazada` (solicitud denegada) a las solicitudes y a su historial. |

Si creas la base desde cero con `schema.sql`, **no los necesitas**: el esquema ya los incluye.

### Fechas del seed

Las reservas y los eventos de prueba se cargan con fechas **relativas al día en que ejecutas `seed.sql`**
(hoy + N días), de modo que siempre quedan en el futuro y las reglas de negocio las aceptan.
Las solicitudes y notificaciones de ejemplo son históricas, con fechas fijas.

## Cuentas de prueba

Todas son ficticias. En la base solo se guardan sus hashes bcrypt.

| Correo | Contraseña | Rol |
|---|---|---|
| `estudiante@uajs.edu.co` | `estudiante123` | estudiante |
| `estudiante2@uajs.edu.co` | `estudiante123` | estudiante |
| `docente@uajs.edu.co` | `docente123` | docente |
| `administrativo@uajs.edu.co` | `administrativo123` | administrativo |
| `admin@uajs.edu.co` | `admin123` | admin |

## Tablas y propiedad de los datos

Cada tabla pertenece a un microservicio: solo ese servicio debe leerla y modificarla.

| Microservicio | Tablas que posee |
|---|---|
| users-service | `roles`, `usuarios` |
| requests-service | `solicitudes`, `solicitud_historial` |
| reservations-service | `reservas` |
| resources-service | `recursos` |
| events-service | `eventos` |
| notifications-service | `notificaciones` |
| (catálogo del frontend) | `servicios` — sin servicio propietario por ahora |

### Decisión transitoria: una sola base de datos compartida

Por tiempo, los seis microservicios usan **la misma base de datos** (`uajs_smart_campus`), cada uno con su
propio conjunto de tablas. Es una decisión **transitoria**: la propiedad de los datos está definida arriba,
pero la base no está aislada por servicio.

Excepciones conocidas que hoy rompen la propiedad de los datos:

- Existen claves foráneas entre dominios (`reservas` → `recursos` y `usuarios`; `solicitudes` → `usuarios`;
  `notificaciones` → `usuarios`).
- `reservations-service` hace un `JOIN` con `recursos` para listar el nombre del recurso.

Evolución prevista: una base (o esquema) por servicio, sin claves foráneas entre ellos; las validaciones
entre dominios (por ejemplo, que el recurso exista al reservar) se harían mediante llamadas HTTP entre
servicios.

## Decisiones de diseño

- **Roles:** tabla `roles` cuya clave primaria es el código del rol (`estudiante`, `docente`,
  `administrativo`, `admin`). Es el mismo valor que viaja en el JWT, así que no hace falta traducir ids.
  `usuarios.rol` es clave foránea hacia ella.
- **Codificación:** ambos scripts empiezan con `SET NAMES utf8mb4`, así los acentos y la `ñ` se guardan bien
  sin importar la configuración del cliente `mysql` (sin esto, `María` o `En revisión` se guardarían
  corruptos como `MarÃ­a`). Si ves caracteres raros, recrea la base con los comandos de arriba.
- **Contraseñas:** se guardan como hash **bcrypt** (costo 10), nunca en texto plano.
- **Usuarios:** `activo` permite desactivar una cuenta sin borrarla (conserva sus solicitudes y reservas).
- **Reservas:** cada reserva ocupa una franja de una hora (`fecha` + `hora` de inicio). La columna `activa`
  vale `1` mientras la reserva no esté cancelada y `NULL` al cancelarla. La restricción
  `UNIQUE (recurso_id, fecha, hora, activa)` hace que **la propia base rechace** dos reservas activas del
  mismo recurso en la misma franja; como en MySQL `NULL` no choca con `NULL`, las reservas canceladas no
  bloquean la franja. La aplicación debe mantener `activa` sincronizada con `estado` (lo hace
  `ReservationModel.updateStatus`).
- **Recursos:** `estado` es el ciclo de vida (`Activo`, `Mantenimiento`, `Inactivo`: solo un recurso activo
  se puede reservar); `disponible` indica la disponibilidad operativa del momento. `tipo` está restringido
  a un catálogo (`Laboratorio`, `Sala`, `Equipo`, `Espacio`).
- **Solicitudes:** `codigo` (por ejemplo `SOL-0001`) lo asigna el backend al crear la solicitud.
  `solicitud_historial` registra cada cambio de estado con quién lo hizo y cuándo. `solucion` se llena al
  resolver.
- **Notificaciones:** `entidad` y `entidad_id` indican qué registro originó el aviso (por ejemplo
  `solicitud` / `12`). No llevan clave foránea porque pueden apuntar a tablas de otro servicio.
- **Nombres en español** (`usuarios`, `recursos`, `creado_en`...), por coherencia con el código del Entregable 1.

### Diferencias frente al modelo sugerido en la guía del Entregable 2

La guía permite variar el modelo si se justifica. Estas son las diferencias:

| Guía | Este proyecto | Motivo |
|---|---|---|
| `role_id` numérico | `rol` con el código del rol | Es el valor que ya usan el JWT y el frontend. |
| `Reservations.start_at` / `end_at` | `fecha` + `hora` (franja de una hora) | El formulario del frontend trabaja con franjas; simplifica la regla de solapamiento. |
| `Requests.code` | `codigo`, asignado por el backend | Se genera a partir del `id` al crear la solicitud. |
| `notifications.read_at` | `leida` + `leida_en` | `leida` ya lo usa el frontend; `leida_en` guarda la fecha. |
| `events.start_time` / `end_time` | `hora` / `hora_fin` (texto, p. ej. `8:00 AM`) | Mantiene el formato que ya muestra el frontend. |

## Reglas de eliminación

| Relación | Al borrar el registro padre |
|---|---|
| `usuarios` → `solicitudes`, `reservas`, `eventos`, historial | El campo queda en `NULL` (`SET NULL`): se conserva el registro. |
| `usuarios` → `notificaciones` | Se borran las notificaciones del usuario (`CASCADE`). |
| `recursos` → `reservas` | **Se impide** borrar un recurso con reservas (`RESTRICT`): responde 409. |
| `solicitudes` → `solicitud_historial` | Se borra el historial junto con la solicitud (`CASCADE`). |
| `roles` → `usuarios` | **Se impide** borrar un rol en uso (`RESTRICT`). |
