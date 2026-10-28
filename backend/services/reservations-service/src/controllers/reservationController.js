import { ReservationModel } from '../models/reservationModel.js'
import { asyncHandler } from '../../../../shared/http.js'
import { badRequest, conflict, forbidden, notFound } from '../../../../shared/errors.js'
import { canSeeAll, isStaff } from '../../../../shared/auth.js'
import { fetchRecord } from '../../../../shared/serviceClient.js'
import { notifyUser } from '../../../../shared/notify.js'
import { formatDateEs } from '../../../../shared/clock.js'
import { parseId, validate } from '../../../../shared/validate.js'
import { checkSlot, checkStatusChange } from '../rules/reservationRules.js'

const ESTADOS = ['Pendiente', 'Confirmada', 'Cancelada']

const filterRules = {
  usuario_id: { type: 'int', min: 1, label: 'El usuario' },
  recurso_id: { type: 'int', min: 1, label: 'El recurso' },
  estado: { type: 'enum', values: ESTADOS, label: 'El estado' }
}

const slotRules = {
  fecha: { type: 'date', required: true, label: 'La fecha' },
  hora: { type: 'time', required: true, label: 'La hora' },
  proposito: { type: 'string', maxLength: 255, label: 'El propósito' }
}

const createRules = {
  recurso_id: { type: 'int', min: 1, required: true, label: 'El recurso' },
  usuario_id: { type: 'int', min: 1, label: 'El usuario' },
  ...slotRules
}

const invalidReference = (field, message) =>
  badRequest(message, [{ field, message }], 'INVALID_REFERENCE')

const isOwner = (req, reservation) => reservation.usuario_id === req.user.id

async function findOrFail(idParam) {
  const reservation = await ReservationModel.findById(parseId(idParam))
  if (!reservation) throw notFound('Reserva no encontrada.', 'RESERVATION_NOT_FOUND')
  return reservation
}

// "Laboratorio de Redes el 22 de octubre de 2026 a las 10:00 AM"
const describe = (reservation) =>
  `${reservation.recurso} el ${formatDateEs(reservation.fecha)} a las ${reservation.hora}`

const notifyReservation = (reservation, titulo, mensaje) =>
  notifyUser({
    usuario_id: reservation.usuario_id,
    titulo,
    mensaje,
    tipo: 'reserva',
    entidad: 'reserva',
    entidad_id: reservation.id
  })

export const ReservationController = {
  list: asyncHandler(async (req, res) => {
    const filters = validate(req.query, filterRules)
    // Cada usuario solo ve sus reservas; el personal administrativo y el admin ven todas.
    if (!canSeeAll(req.user)) filters.usuario_id = req.user.id
    res.json(await ReservationModel.findAll(filters))
  }),

  getById: asyncHandler(async (req, res) => {
    const reservation = await findOrFail(req.params.id)
    if (!canSeeAll(req.user) && !isOwner(req, reservation)) {
      throw forbidden('No tienes permiso para ver esta reserva.')
    }
    res.json(reservation)
  }),

  /**
   * Flujo: validar datos -> validar la franja -> consultar Recursos y Usuarios (HTTP) ->
   * guardar -> avisar. Si Recursos o Usuarios no responden se devuelve un 503 controlado
   * y NO se crea nada. Si la franja ya está ocupada, la base lo impide (409).
   */
  create: asyncHandler(async (req, res) => {
    const data = validate(req.body, createRules)
    // Por defecto la reserva queda a nombre de quien la hace. Solo el personal puede reservar
    // a nombre de otra persona.
    if (data.usuario_id === null) data.usuario_id = req.user.id
    else if (!isStaff(req.user) && data.usuario_id !== req.user.id) {
      throw forbidden('No puedes crear reservas a nombre de otro usuario.')
    }
    if (!data.usuario_id) throw invalidReference('usuario_id', 'El usuario es obligatorio.')
    checkSlot(data)

    const [resource, user] = await Promise.all([
      fetchRecord('resources', `/api/resources/${data.recurso_id}`),
      fetchRecord('users', `/api/users/${data.usuario_id}`)
    ])
    if (!resource) throw invalidReference('recurso_id', 'El recurso indicado no existe.')
    if (!user) throw invalidReference('usuario_id', 'El usuario indicado no existe.')
    if (!user.activo) throw conflict('La cuenta del usuario está desactivada.', 'USER_DISABLED')
    if (resource.estado !== 'Activo' || !resource.disponible) {
      throw conflict(
        `El recurso "${resource.nombre}" no está disponible para reservar en este momento.`,
        'RESOURCE_UNAVAILABLE'
      )
    }

    const reservation = await ReservationModel.create(data)
    await notifyReservation(
      reservation,
      'Reserva registrada',
      `Tu reserva de ${describe(reservation)} quedó pendiente de confirmación.`
    )
    res.status(201).json(reservation)
  }),

  // PUT: mueve la reserva a otra fecha u hora. Una reserva cancelada no se puede modificar.
  update: asyncHandler(async (req, res) => {
    const reservation = await findOrFail(req.params.id)
    if (!isStaff(req.user) && !isOwner(req, reservation)) {
      throw forbidden('Solo puedes modificar tus propias reservas.')
    }
    if (reservation.estado === 'Cancelada') {
      throw conflict('Una reserva cancelada no se puede modificar.', 'RESERVATION_CANCELLED')
    }
    const data = validate(req.body, slotRules)
    checkSlot(data)

    const updated = await ReservationModel.update(reservation.id, data)
    await notifyReservation(updated, 'Reserva modificada', `Tu reserva ahora es de ${describe(updated)}.`)
    res.json(updated)
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const reservation = await findOrFail(req.params.id)
    const { estado } = validate(req.body, {
      estado: { type: 'enum', values: ESTADOS, required: true, label: 'El estado' }
    })
    // Quien reservó puede cancelar su reserva; confirmarla o gestionar la de otros es del personal.
    if (!isStaff(req.user)) {
      if (!isOwner(req, reservation)) throw forbidden('Solo puedes gestionar tus propias reservas.')
      if (estado !== 'Cancelada') {
        throw forbidden('Solo el personal administrativo puede confirmar reservas; tú puedes cancelar la tuya.')
      }
    }
    checkStatusChange(reservation, estado)

    const updated = await ReservationModel.updateStatus(reservation.id, estado)
    if (estado === 'Confirmada') {
      await notifyReservation(updated, 'Reserva confirmada', `Tu reserva de ${describe(updated)} fue confirmada.`)
    } else if (estado === 'Cancelada') {
      await notifyReservation(updated, 'Reserva cancelada', `Tu reserva de ${describe(updated)} fue cancelada.`)
    }
    res.json(updated)
  }),

  remove: asyncHandler(async (req, res) => {
    const reservation = await findOrFail(req.params.id)
    await ReservationModel.remove(reservation.id)
    res.status(204).send()
  })
}
