import { badRequest, conflict } from '../../../../shared/errors.js'

/**
 * Ciclo de vida de una solicitud (guía del Entregable 2, sección 7.4):
 *
 *   Registrada -> En revisión -> Asignada -> En proceso -> Resuelta -> Cerrada
 *
 * Decisión del equipo: una solicitud Resuelta se puede REABRIR (volver a "En proceso")
 * si el solicitante no queda conforme, siempre que se indique el motivo en el comentario.
 * El personal puede DENEGAR una solicitud mientras todavía no se haya empezado a atender
 * (Registrada o En revisión), indicando el motivo. Una vez que está Asignada o en curso ya no se deniega.
 * Cerrada y Rechazada son estados finales: ya no admiten ningún cambio.
 */
export const TRANSITIONS = {
  'Registrada': ['En revisión', 'Rechazada'],
  'En revisión': ['Asignada', 'Rechazada'],
  'Asignada': ['En proceso'],
  'En proceso': ['Resuelta'],
  'Resuelta': ['Cerrada', 'En proceso'],
  'Cerrada': [],
  'Rechazada': []
}

/** Estados finales: la solicitud ya no se puede editar ni cambiar de estado. */
export const FINAL_STATES = ['Cerrada', 'Rechazada']

const missing = (field, message) => badRequest(message, [{ field, message }], 'MISSING_REQUIREMENT')

/**
 * Verifica que el cambio de estado sea válido. Lanza un error si no lo es:
 *  - 409 INVALID_TRANSITION: el salto no está permitido.
 *  - 400 MISSING_REQUIREMENT: falta un dato que ese cambio exige.
 */
export function checkTransition(request, { estado, responsable, solucion, comentario }) {
  const from = request.estado

  if (estado === from) {
    throw conflict(`La solicitud ya está en estado "${from}".`, 'INVALID_TRANSITION')
  }

  const allowed = TRANSITIONS[from] ?? []
  if (!allowed.includes(estado)) {
    const hint = allowed.length
      ? `Desde "${from}" solo es posible pasar a: ${allowed.join(' o ')}.`
      : `Una solicitud "${from}" ya no admite cambios de estado.`
    throw conflict(`No se puede pasar una solicitud de "${from}" a "${estado}". ${hint}`, 'INVALID_TRANSITION')
  }

  if (estado === 'Rechazada' && !comentario) {
    throw missing('comentario', 'Para denegar una solicitud debes indicar el motivo.')
  }
  if (from === 'Resuelta' && estado === 'En proceso' && !comentario) {
    throw missing('comentario', 'Para reabrir una solicitud resuelta debes indicar el motivo en el comentario.')
  }
  if (estado === 'Asignada' && !(responsable || request.responsable)) {
    throw missing('responsable', 'Para asignar la solicitud debes indicar un responsable.')
  }
  if (estado === 'Resuelta' && !(solucion || request.solucion)) {
    throw missing('solucion', 'Para resolver la solicitud debes registrar la solución.')
  }
}
