import { badRequest, notFound } from './errors.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIME_REGEX = /^(\d{1,2}):([0-5]\d)\s*([AaPp])\.?[Mm]\.?$/

/** Convierte el :id de la URL en entero positivo; si no lo es, el registro no puede existir (404). */
export function parseId(value) {
  const text = String(value ?? '')
  const number = Number(text)
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(number) || number < 1) {
    throw notFound('No existe un registro con el identificador indicado.')
  }
  return number
}

/** '09:00 am' -> '9:00 AM'. Devuelve null si no es una hora válida. */
export function normalizeTime(value) {
  const match = TIME_REGEX.exec(String(value).trim())
  if (!match) return null
  const hour = Number(match[1])
  if (hour < 1 || hour > 12) return null
  return `${hour}:${match[2]} ${match[3].toUpperCase()}M`
}

/** '2:30 PM' -> 870 (minutos desde la medianoche). Sirve para comparar horas. */
export function timeToMinutes(value) {
  const normalized = normalizeTime(value)
  if (!normalized) return null
  const [clock, suffix] = normalized.split(' ')
  const [hour, minute] = clock.split(':').map(Number)
  return (hour % 12) * 60 + minute + (suffix === 'PM' ? 12 * 60 : 0)
}

/** true si el texto AAAA-MM-DD es una fecha real del calendario. */
export function isRealDate(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (!match) return false
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

// "La fecha es obligatoria", "El nombre es obligatorio", "Los datos son obligatorios"...
function requiredMessage(label) {
  const feminine = /^las?\s/i.test(label)
  const plural = /^(las|los)\s/i.test(label)
  const word = `obligatori${feminine ? 'a' : 'o'}${plural ? 's' : ''}`
  return `${label} ${plural ? 'son' : 'es'} ${word}.`
}

// Cada verificador devuelve { value } si el dato es válido o { error } con el motivo.
function check(raw, rule) {
  switch (rule.type) {
    case 'string': {
      if (typeof raw !== 'string') return { error: 'debe ser un texto.' }
      const text = raw.trim()
      if (rule.minLength && text.length < rule.minLength) return { error: `debe tener al menos ${rule.minLength} caracteres.` }
      if (rule.maxLength && text.length > rule.maxLength) return { error: `no puede superar ${rule.maxLength} caracteres.` }
      if (rule.pattern && !rule.pattern.test(text)) return { error: rule.patternMessage || 'no tiene un formato válido.' }
      return { value: text }
    }
    case 'secret': { // contraseñas: no se recortan espacios
      if (typeof raw !== 'string') return { error: 'debe ser un texto.' }
      if (rule.minLength && raw.length < rule.minLength) return { error: `debe tener al menos ${rule.minLength} caracteres.` }
      if (rule.maxLength && raw.length > rule.maxLength) return { error: `no puede superar ${rule.maxLength} caracteres.` }
      return { value: raw }
    }
    case 'email': {
      if (typeof raw !== 'string') return { error: 'debe ser un texto.' }
      const text = raw.trim().toLowerCase()
      if (!EMAIL_REGEX.test(text) || text.length > 150) return { error: 'no tiene un formato válido.' }
      return { value: text }
    }
    case 'int': {
      const number = typeof raw === 'number' ? raw
        : typeof raw === 'string' && /^-?\d+$/.test(raw.trim()) ? Number(raw) : NaN
      if (!Number.isSafeInteger(number)) return { error: 'debe ser un número entero.' }
      if (rule.min !== undefined && number < rule.min) return { error: `debe ser mayor o igual a ${rule.min}.` }
      return { value: number }
    }
    case 'boolean': {
      if (raw === true || raw === 1 || raw === '1' || raw === 'true') return { value: true }
      if (raw === false || raw === 0 || raw === '0' || raw === 'false') return { value: false }
      return { error: 'debe ser verdadero o falso.' }
    }
    case 'date': {
      if (typeof raw !== 'string' || !isRealDate(raw.trim())) {
        return { error: 'debe tener el formato AAAA-MM-DD y ser una fecha real.' }
      }
      return { value: raw.trim() }
    }
    case 'time': {
      const normalized = normalizeTime(raw)
      if (!normalized) return { error: 'debe tener el formato H:MM AM/PM, por ejemplo 2:30 PM.' }
      return { value: normalized }
    }
    case 'enum': {
      const canonical = typeof raw === 'string'
        ? rule.values.find((v) => v.toLowerCase() === raw.trim().toLowerCase())
        : undefined
      if (!canonical) return { error: `debe ser uno de: ${rule.values.join(', ')}.` }
      return { value: canonical }
    }
    default:
      throw new Error(`Tipo de validación desconocido: ${rule.type}`)
  }
}

/**
 * Valida `data` contra `rules` y devuelve un objeto limpio con SOLO los campos
 * declarados (lo demás se ignora: así no se puede "colar" un campo como estado o rol).
 * Los campos opcionales ausentes quedan en `rule.default` o en null.
 * Si algo es inválido lanza un 400 con el detalle de cada campo.
 *
 * Regla: { type, required, label, default, maxLength, minLength, pattern, values, min }
 */
export function validate(data, rules) {
  if (data === null || data === undefined || typeof data !== 'object' || Array.isArray(data)) {
    throw badRequest('El cuerpo de la petición debe ser un objeto JSON.')
  }

  const clean = {}
  const errors = []

  for (const [field, rule] of Object.entries(rules)) {
    const raw = data[field]
    const isEmpty =
      raw === undefined || raw === null ||
      (typeof raw === 'string' && raw.trim() === '' && rule.type !== 'secret')

    if (isEmpty) {
      if (rule.required) errors.push({ field, message: requiredMessage(rule.label) })
      else clean[field] = rule.default !== undefined ? rule.default : null
      continue
    }

    const result = check(raw, rule)
    if (result.error) errors.push({ field, message: `${rule.label} ${result.error}` })
    else clean[field] = result.value
  }

  if (errors.length) throw badRequest(errors.map((e) => e.message).join(' '), errors)
  return clean
}
