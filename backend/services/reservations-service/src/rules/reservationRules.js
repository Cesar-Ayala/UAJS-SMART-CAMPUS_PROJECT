import { badRequest, conflict } from '../../../../shared/errors.js'
import { addDays, nowMinutes, todayKey } from '../../../../shared/clock.js'
import { timeToMinutes } from '../../../../shared/validate.js'

// Las reservas son franjas de una hora, de 7:00 AM a 7:00 PM, con hasta 90 días de anticipación.
export const OPEN_MINUTES = 7 * 60
export const CLOSE_MINUTES = 19 * 60
export const MAX_DAYS_AHEAD = 90

/**
 * Estados de una reserva. Una reserva cancelada es definitiva: no se puede modificar
 * ni reactivar (quien la necesite de nuevo hace una reserva nueva).
 */
export const STATUS_TRANSITIONS = {
  Pendiente: ['Confirmada', 'Cancelada'],
  Confirmada: ['Cancelada'],
  Cancelada: []
}

/** Verifica que la fecha y la hora sean una franja reservable. `now` se puede inyectar en pruebas. */
export function checkSlot({ fecha, hora }, now = new Date()) {
  const errors = []
  const minutes = timeToMinutes(hora)

  if (minutes % 60 !== 0 || minutes < OPEN_MINUTES || minutes > CLOSE_MINUTES) {
    errors.push({
      field: 'hora',
      message: 'Las reservas son por franjas de una hora, entre 7:00 AM y 7:00 PM (por ejemplo 2:00 PM).'
    })
  }

  const today = todayKey(now)
  if (fecha < today) {
    errors.push({ field: 'fecha', message: 'La fecha de la reserva no puede estar en el pasado.' })
  } else if (fecha > addDays(today, MAX_DAYS_AHEAD)) {
    errors.push({ field: 'fecha', message: `Solo se puede reservar con hasta ${MAX_DAYS_AHEAD} días de anticipación.` })
  } else if (fecha === today && minutes <= nowMinutes(now)) {
    errors.push({ field: 'hora', message: 'Esa franja de hoy ya comenzó o ya pasó. Elige una hora posterior.' })
  }

  if (errors.length) throw badRequest(errors.map((e) => e.message).join(' '), errors)
}

/** Verifica el cambio de estado de una reserva (409 INVALID_TRANSITION si no está permitido). */
export function checkStatusChange(reservation, nextStatus) {
  const from = reservation.estado
  if (nextStatus === from) {
    throw conflict(`La reserva ya está en estado "${from}".`, 'INVALID_TRANSITION')
  }
  const allowed = STATUS_TRANSITIONS[from] ?? []
  if (!allowed.includes(nextStatus)) {
    const hint = allowed.length
      ? `Desde "${from}" solo es posible pasar a: ${allowed.join(' o ')}.`
      : 'Una reserva cancelada no se puede reactivar: crea una reserva nueva.'
    throw conflict(`No se puede pasar una reserva de "${from}" a "${nextStatus}". ${hint}`, 'INVALID_TRANSITION')
  }
}
