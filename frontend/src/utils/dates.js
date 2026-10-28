/**
 * Utilidades de fechas para reservas.
 * La API devuelve las fechas DATE de MySQL como texto ISO
 * ("2026-08-25T05:00:00.000Z"); los mocks usan "2026-08-25".
 * Estas funciones normalizan ambos formatos a "YYYY-MM-DD" local.
 */

const pad = (n) => String(n).padStart(2, '0')

export function toDateKey(value) {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayKey() {
  return toDateKey(new Date())
}

export function formatDate(value) {
  const [year, month, day] = toDateKey(value).split('-').map(Number)
  if (!year) return String(value)
  return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
