/**
 * Diagnóstico de UAJS Smart Campus.
 *
 * Uso (desde la carpeta backend/):   node scripts/diagnostico.js
 *
 * Comprueba, en orden: configuración, conexión a la base de datos, tablas,
 * cuentas de prueba, codificación de los acentos, servicios en ejecución y un
 * inicio de sesión real a través del API Gateway. Para cada problema indica
 * cómo solucionarlo. No modifica nada.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../shared/db.js' // al importarlo se carga backend/.env

const BACKEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FRONTEND_SRC = path.resolve(BACKEND_DIR, '..', 'frontend', 'src')
const exists = (base, rel) => existsSync(path.join(base, rel))
const contains = (base, rel, text) => exists(base, rel) && readFileSync(path.join(base, rel), 'utf8').includes(text)

const EXPECTED_TABLES = [
  'roles', 'usuarios', 'servicios', 'recursos', 'solicitudes',
  'solicitud_historial', 'reservas', 'eventos', 'notificaciones'
]
const TEST_USERS = [
  'estudiante@uajs.edu.co', 'estudiante2@uajs.edu.co', 'docente@uajs.edu.co',
  'administrativo@uajs.edu.co', 'admin@uajs.edu.co'
]
const RECREATE_DB =
  'Recrea la base: mysql -u root -e "DROP DATABASE IF EXISTS uajs_smart_campus"  y luego ' +
  'mysql -u root < database/schema.sql  y  mysql -u root < database/seed.sql  (ver database/README.md).'

let failures = 0
let warnings = 0
const ok = (msg) => console.log(`  [OK]     ${msg}`)
const warn = (msg, fix) => { warnings++; console.log(`  [AVISO]  ${msg}${fix ? `\n           -> ${fix}` : ''}`) }
const fail = (msg, fix) => { failures++; console.log(`  [FALLA]  ${msg}${fix ? `\n           -> ${fix}` : ''}`) }
const section = (title) => console.log(`\n${title}`)

async function http(method, url, body) {
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000)
    })
    let data = null
    try { data = await res.json() } catch { /* sin cuerpo JSON */ }
    return { status: res.status, data }
  } catch (error) {
    return { status: 0, error }
  }
}

console.log('=== Diagnóstico de UAJS Smart Campus ===')

// ---------------------------------------------------------------- 1. Entorno
section('1. Entorno')
const major = Number(process.versions.node.split('.')[0])
if (major >= 18) ok(`Node.js ${process.versions.node}`)
else fail(`Node.js ${process.versions.node} es demasiado antiguo`, 'Instala Node.js 18 o superior.')

try {
  await import('bcryptjs')
  ok('Dependencia bcryptjs instalada')
} catch {
  fail('Falta la dependencia bcryptjs (el servicio de usuarios no puede arrancar).',
    'Ejecuta "npm install" dentro de la carpeta backend/ y reinicia los servicios.')
}

const dbName = process.env.DB_NAME || 'uajs_smart_campus'
const hasEnv = Boolean(process.env.DB_USER || process.env.DB_PASSWORD || process.env.JWT_SECRET)
if (hasEnv) ok(`Archivo backend/.env leído (base "${dbName}", usuario "${process.env.DB_USER || 'root'}")`)
else warn('No se encontró backend/.env (se usan los valores por defecto: usuario root sin contraseña).',
  'Copia backend/.env.example a backend/.env y ajusta DB_USER y DB_PASSWORD si hace falta.')

// ------------------------------------------------------- 2. Base de datos
section('2. Base de datos')
let dbUp = false
try {
  await pool.query('SELECT 1')
  dbUp = true
  ok('Conexión a MySQL/MariaDB')
} catch (error) {
  const code = error.code || ''
  if (code === 'ER_BAD_DB_ERROR') fail(`La base "${dbName}" no existe.`, RECREATE_DB)
  else if (code === 'ER_ACCESS_DENIED_ERROR') fail('MySQL rechazó el usuario o la contraseña del .env.', 'Revisa DB_USER y DB_PASSWORD en backend/.env.')
  else fail(`No se pudo conectar a MySQL (${code || error.message}).`, 'Enciende MySQL (en XAMPP, el botón Start de MySQL) y revisa DB_HOST y DB_PORT en backend/.env.')
}

let hasActivo = false
if (dbUp) {
  const [tables] = await pool.query('SELECT TABLE_NAME AS t FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?', [dbName])
  const present = new Set(tables.map((r) => r.t))
  const missing = EXPECTED_TABLES.filter((t) => !present.has(t))
  if (missing.length === 0) ok(`Las ${EXPECTED_TABLES.length} tablas esperadas existen`)
  else fail(`Faltan tablas: ${missing.join(', ')}. La base es de una versión anterior.`, RECREATE_DB)

  if (present.has('usuarios')) {
    const [cols] = await pool.query(
      "SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'activo'", [dbName])
    hasActivo = cols[0].n === 1
    if (hasActivo) ok('La tabla usuarios tiene la columna "activo"')
    else fail('La tabla usuarios no tiene la columna "activo": es el esquema anterior y el login responde "cuenta desactivada".', RECREATE_DB)

    if (present.has('solicitudes')) {
      const [enumRows] = await pool.query(
        "SELECT COLUMN_TYPE AS t FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'solicitudes' AND COLUMN_NAME = 'estado'", [dbName])
      if (String(enumRows[0]?.t).includes('Rechazada')) ok('Las solicitudes admiten el estado "Rechazada" (denegar)')
      else fail('A la base le falta el estado "Rechazada" (la función de denegar solicitudes fallará).',
        'Sin borrar datos: ejecuta database/migrations/001_estado_rechazada.sql (con "source" en PowerShell). O recrea la base.')
    }

    // ----------------------------------------------- 3. Cuentas de prueba
    section('3. Cuentas de prueba')
    const [users] = await pool.query(
      'SELECT correo, LENGTH(password_hash) AS largo, LEFT(password_hash, 2) AS prefijo FROM usuarios WHERE correo IN (?)', [TEST_USERS])
    const found = new Map(users.map((u) => [u.correo, u]))
    const notFound = TEST_USERS.filter((c) => !found.has(c))
    if (notFound.length === 0) ok('Existen las 5 cuentas de prueba')
    else fail(`No existen estas cuentas: ${notFound.join(', ')}.`, `${RECREATE_DB} (seed.sql las crea).`)

    const oldHash = users.filter((u) => !(u.prefijo === '$2' && u.largo === 60))
    if (users.length && oldHash.length === 0) ok('Las contraseñas están guardadas como hash bcrypt')
    else if (oldHash.length) fail(
      `${oldHash.length} cuenta(s) tienen la contraseña en formato antiguo (SHA-256), que el login actual no reconoce: ${oldHash.map((u) => u.correo).join(', ')}.`,
      `Por eso el login responde "Credenciales inválidas". ${RECREATE_DB}`)

    const [enc] = await pool.query("SELECT HEX(nombre) AS h FROM usuarios WHERE correo = 'estudiante@uajs.edu.co'")
    if (enc[0]) {
      if (enc[0].h.includes('C383')) fail('Los acentos están guardados con doble codificación (se ve "MarÃ­a" en vez de "María").',
        `Los scripts nuevos ya lo evitan (SET NAMES utf8mb4). ${RECREATE_DB}`)
      else ok('Los acentos están bien codificados (UTF-8)')
    }
  }
}

// ----------------------------------------------------------- 4. Servicios
section('4. Servicios en ejecución')
const gatewayPort = process.env.GATEWAY_PORT || 4000
const gateway = `http://localhost:${gatewayPort}`
const services = [
  ['Gateway', gatewayPort, '/api/health'],
  ['users-service', process.env.USERS_PORT || 4001, '/health'],
  ['requests-service', process.env.REQUESTS_PORT || 4002, '/health'],
  ['reservations-service', process.env.RESERVATIONS_PORT || 4003, '/health'],
  ['resources-service', process.env.RESOURCES_PORT || 4004, '/health'],
  ['events-service', process.env.EVENTS_PORT || 4005, '/health'],
  ['notifications-service', process.env.NOTIFICATIONS_PORT || 4006, '/health']
]
const down = []
for (const [name, port, route] of services) {
  const res = await http('GET', `http://localhost:${port}${route}`)
  if (res.status === 200) ok(`${name} responde en el puerto ${port}`)
  else { down.push(name); fail(`${name} NO responde en el puerto ${port}.`, 'Inícialo y mira en su terminal el motivo si se cierra (por ejemplo "Cannot find package").') }
}

// -------------------------------------------------------- 5. Login real
section('5. Inicio de sesión real (estudiante@uajs.edu.co) a través del Gateway')
const login = await http('POST', `${gateway}/api/users/auth/login`, { correo: 'estudiante@uajs.edu.co', password: 'estudiante123' })
const code = login.data?.code
if (login.status === 200 && login.data?.token) ok(`Login correcto (rol: ${login.data.user?.rol})`)
else if (login.status === 0) fail(`No se pudo contactar al Gateway en ${gateway}.`, 'Inicia el API Gateway.')
else if (login.status === 502) fail('El Gateway no logra comunicarse con users-service.', 'Inicia users-service (si se cierra solo, revisa su terminal).')
else if (login.status === 503) fail('users-service no puede conectarse a la base de datos.', 'Revisa la sección 2.')
else if (code === 'INVALID_CREDENTIALS') fail('Credenciales inválidas con la cuenta de prueba.', 'Casi siempre es la base antigua (sección 3): ' + RECREATE_DB)
else if (code === 'ACCOUNT_DISABLED') fail('Cuenta desactivada.', 'Esquema anterior (sección 2): ' + RECREATE_DB)
else fail(`Respuesta inesperada: HTTP ${login.status} ${JSON.stringify(login.data)}`)

// ----------------------------------------------- 6. Versión del código instalada
section('6. Versión del código (¿falta aplicar algún ZIP?, ¿hay servicios viejos corriendo?)')
const BACKEND_STEPS = [
  ['paso 2 (errores y validación)', 'paso2_backend_y_cambios.zip', () => ['shared/errors.js', 'shared/http.js', 'shared/validate.js'].every((f) => exists(BACKEND_DIR, f))],
  ['paso 3 (reglas de negocio)', 'paso3_reglas_de_negocio.zip', () => ['shared/clock.js', 'shared/serviceClient.js', 'shared/notify.js',
    'services/reservations-service/src/rules/reservationRules.js'].every((f) => exists(BACKEND_DIR, f))],
  ['paso 4 (roles y permisos)', 'paso4_roles_y_permisos.zip', () => exists(BACKEND_DIR, 'shared/auth.js')],
  ['paso 5 (denegar solicitudes)', 'paso5_gestion_por_rol.zip', () => contains(BACKEND_DIR, 'services/requests-service/src/rules/requestRules.js', "'Rechazada'")]
]
for (const [name, zip, check] of BACKEND_STEPS) {
  if (check()) ok(`Backend ${name} instalado`)
  else fail(`Backend ${name} NO está instalado (faltan archivos).`, `Extrae ${zip} en la raíz del proyecto y reinicia los servicios.`)
}

if (existsSync(FRONTEND_SRC)) {
  const FRONTEND_STEPS = [
    ['paso 4 (cierre de sesión por token vencido)', 'paso4_roles_y_permisos.zip', () => contains(FRONTEND_SRC, 'api/client.js', 'interceptors.response')],
    ['paso 5 (panel de solicitudes, recursos y eventos)', 'paso5_gestion_por_rol.zip', () => ['components/requests/RequestStatusPanel.jsx',
      'components/resources/ResourceManager.jsx', 'components/events/EventForm.jsx', 'hooks/usePermissions.js'].every((f) => exists(FRONTEND_SRC, f))],
    ['paso 6 (notificaciones leídas y franjas)', 'paso6_notificaciones_y_franjas.zip', () => exists(FRONTEND_SRC, 'pages/Notifications.css')]
  ]
  for (const [name, zip, check] of FRONTEND_STEPS) {
    if (check()) ok(`Frontend ${name} instalado`)
    else fail(`Frontend ${name} NO está instalado.`, `Extrae ${zip} en la raíz del proyecto.`)
  }
} else {
  warn('No se encontró la carpeta frontend/ junto a backend/: se omiten las comprobaciones del frontend.')
}

// Comprobaciones sobre lo que está CORRIENDO (solo lecturas, no modifican datos).
if (down.length < services.length) {
  const anon = await http('GET', `${gateway}/api/resources`)
  if (anon.status === 401) ok('Los servicios en ejecución exigen sesión (código del paso 4 en marcha)')
  else if (anon.status === 200) fail('Los servicios en ejecución responden SIN pedir sesión: son una versión anterior que sigue corriendo.',
    'Cierra todos los procesos de Node (Ctrl+C en cada terminal) y arranca de nuevo con "npm run dev" desde backend/.')
  else if (anon.status !== 0) warn(`Respuesta inesperada de /api/resources sin sesión: HTTP ${anon.status}.`)

  if (login.status === 200 && login.data?.token) {
    const bad = await fetch(`${gateway}/api/requests/abc`, { headers: { Authorization: `Bearer ${login.data.token}` }, signal: AbortSignal.timeout(5000) }).catch(() => null)
    const body = bad ? await bad.json().catch(() => null) : null
    if (bad?.status === 404 && body?.code) ok('Los errores tienen el formato esperado { message, code } (código del paso 2 en marcha)')
    else if (bad) fail('Los errores no tienen el formato esperado: los servicios en ejecución son una versión anterior.',
      'Cierra todos los procesos de Node y arranca de nuevo con "npm run dev" desde backend/.')
  }
}

// ------------------------------------------------------------- Resumen
console.log('\n=== Resumen ===')
if (failures === 0 && warnings === 0) console.log('Todo en orden: la configuración y el login funcionan.')
else if (failures === 0) console.log(`Sin fallas, con ${warnings} aviso(s).`)
else console.log(`${failures} falla(s) y ${warnings} aviso(s). Arregla primero las de arriba hacia abajo: una suele causar las siguientes.`)

await pool.end()
process.exit(failures === 0 ? 0 : 1)
