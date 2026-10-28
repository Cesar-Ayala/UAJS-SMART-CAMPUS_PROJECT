/**
 * Fecha y hora "de negocio".
 *
 * Se calculan en la zona horaria configurada (APP_TIMEZONE, por defecto America/Bogota)
 * y no en la del servidor, para que "hoy" y "ahora" signifiquen lo mismo en tu equipo
 * y en un contenedor Docker (que normalmente trabaja en UTC).
 */
const timeZone = () => process.env.APP_TIMEZONE || 'America/Bogota'

function clockParts(now) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone(),
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  })
  return Object.fromEntries(formatter.formatToParts(now).map((part) => [part.type, part.value]))
}

/** Fecha de hoy como 'AAAA-MM-DD'. */
export function todayKey(now = new Date()) {
  const { year, month, day } = clockParts(now)
  return `${year}-${month}-${day}`
}

/** Minutos transcurridos desde la medianoche (por ejemplo 2:30 PM -> 870). */
export function nowMinutes(now = new Date()) {
  const { hour, minute } = clockParts(now)
  return Number(hour) * 60 + Number(minute)
}

/** Suma días a una fecha 'AAAA-MM-DD'. */
export function addDays(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

/** '2026-10-22' -> '22 de octubre de 2026' (para los textos de las notificaciones). */
export function formatDateEs(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number)
  if (!year) return String(dateKey)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('es-CO', {
    timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric'
  })
}
