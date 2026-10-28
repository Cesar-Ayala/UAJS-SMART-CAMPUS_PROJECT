import { EventModel } from '../models/eventModel.js'
import { asyncHandler } from '../../../../shared/http.js'
import { badRequest, forbidden, notFound } from '../../../../shared/errors.js'
import { callService } from '../../../../shared/serviceClient.js'
import { notifyUser } from '../../../../shared/notify.js'
import { formatDateEs, todayKey } from '../../../../shared/clock.js'
import { parseId, timeToMinutes, validate } from '../../../../shared/validate.js'

const ESTADOS = ['Programado', 'Cancelado', 'Finalizado']

const baseRules = {
  nombre: { type: 'string', required: true, maxLength: 150, label: 'El nombre del evento' },
  fecha: { type: 'date', required: true, label: 'La fecha' },
  hora: { type: 'time', required: true, label: 'La hora de inicio' },
  hora_fin: { type: 'time', label: 'La hora de finalización' },
  lugar: { type: 'string', required: true, maxLength: 150, label: 'El lugar' },
  descripcion: { type: 'string', maxLength: 2000, label: 'La descripción' }
}

const createRules = {
  ...baseRules,
  estado: { type: 'enum', values: ESTADOS, default: 'Programado', label: 'El estado' },
  creado_por: { type: 'int', min: 1, label: 'El usuario creador' }
}

// En PUT, si no se envía el estado se conserva el actual.
const updateRules = {
  ...baseRules,
  estado: { type: 'enum', values: ESTADOS, label: 'El estado' }
}

function assertValidTimeRange(data) {
  if (data.hora_fin && timeToMinutes(data.hora_fin) <= timeToMinutes(data.hora)) {
    const message = 'La hora de finalización debe ser posterior a la hora de inicio.'
    throw badRequest(message, [{ field: 'hora_fin', message }])
  }
}

// Un evento "Programado" no puede tener una fecha que ya pasó (los pasados se marcan Finalizado).
function assertNotInThePast(data) {
  if (data.estado === 'Programado' && data.fecha < todayKey()) {
    const message = 'La fecha de un evento programado no puede estar en el pasado.'
    throw badRequest(message, [{ field: 'fecha', message }])
  }
}

// Avisa de un evento nuevo a todos los usuarios activos. Es "mejor esfuerzo": si algo falla
// el evento ya quedó creado y solo se registra el aviso en el log.
async function announceEvent(event) {
  try {
    const { status, data } = await callService('users', '/api/users')
    if (status !== 200 || !Array.isArray(data)) return
    await Promise.allSettled(
      data
        .filter((user) => user.activo)
        .map((user) =>
          notifyUser({
            usuario_id: user.id,
            titulo: 'Nuevo evento',
            mensaje: `Se programó "${event.nombre}" para el ${formatDateEs(event.fecha)} a las ${event.hora}.`,
            tipo: 'evento',
            entidad: 'evento',
            entidad_id: event.id
          })
        )
    )
  } catch (error) {
    console.warn('[events-service] no se pudo avisar del nuevo evento:', error.message)
  }
}

// Un docente solo puede modificar o eliminar los eventos que él publicó; el personal y el admin, cualquiera.
function assertCanModify(req, event) {
  if (req.user.rol === 'docente' && event.creado_por !== req.user.id) {
    throw forbidden('Solo puedes modificar los eventos que tú publicaste.')
  }
}

async function findOrFail(idParam) {
  const event = await EventModel.findById(parseId(idParam))
  if (!event) throw notFound('Evento no encontrado.', 'EVENT_NOT_FOUND')
  return event
}

export const EventController = {
  list: asyncHandler(async (req, res) => {
    const filters = validate(req.query, {
      estado: { type: 'enum', values: ESTADOS, label: 'El estado' }
    })
    res.json(await EventModel.findAll(filters))
  }),

  getById: asyncHandler(async (req, res) => {
    res.json(await findOrFail(req.params.id))
  }),

  create: asyncHandler(async (req, res) => {
    const data = validate(req.body, createRules)
    data.creado_por = req.user.id // el autor es siempre quien publica, no un dato del cliente
    assertValidTimeRange(data)
    assertNotInThePast(data)
    const event = await EventModel.create(data)
    // Solo se avisa de eventos futuros: uno que se registra ya Finalizado o Cancelado no es noticia.
    if (event.estado === 'Programado') await announceEvent(event)
    res.status(201).json(event)
  }),

  update: asyncHandler(async (req, res) => {
    const event = await findOrFail(req.params.id)
    assertCanModify(req, event)
    const data = validate(req.body, updateRules)
    assertValidTimeRange(data)
    const merged = { ...data, estado: data.estado ?? event.estado }
    assertNotInThePast(merged)
    res.json(await EventModel.update(event.id, merged))
  }),

  remove: asyncHandler(async (req, res) => {
    const event = await findOrFail(req.params.id)
    assertCanModify(req, event)
    await EventModel.remove(event.id)
    res.status(204).send()
  })
}
