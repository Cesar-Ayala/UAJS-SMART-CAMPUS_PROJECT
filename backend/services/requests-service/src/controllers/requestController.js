import { RequestModel } from '../models/requestModel.js'
import { asyncHandler } from '../../../../shared/http.js'
import { conflict, forbidden, notFound } from '../../../../shared/errors.js'
import { canSeeAll, isStaff } from '../../../../shared/auth.js'
import { notifyUser } from '../../../../shared/notify.js'
import { parseId, validate } from '../../../../shared/validate.js'
import { checkTransition, FINAL_STATES } from '../rules/requestRules.js'

const ESTADOS = ['Registrada', 'En revisión', 'Asignada', 'En proceso', 'Resuelta', 'Cerrada', 'Rechazada']
const PRIORIDADES = ['baja', 'media', 'alta']

const filterRules = {
  estado: { type: 'enum', values: ESTADOS, label: 'El estado' },
  usuario_id: { type: 'int', min: 1, label: 'El usuario' }
}

const createRules = {
  tipo: { type: 'string', required: true, maxLength: 150, label: 'El tipo' },
  dependencia: { type: 'string', maxLength: 150, label: 'La dependencia' },
  descripcion: { type: 'string', required: true, maxLength: 2000, label: 'La descripción' },
  prioridad: { type: 'enum', values: PRIORIDADES, default: 'media', label: 'La prioridad' },
  usuario_id: { type: 'int', min: 1, label: 'El usuario' }
}

const updateRules = {
  tipo: createRules.tipo,
  dependencia: createRules.dependencia,
  descripcion: createRules.descripcion,
  prioridad: createRules.prioridad,
  responsable: { type: 'string', maxLength: 150, label: 'El responsable' }
}

const statusRules = {
  estado: { type: 'enum', values: ESTADOS, required: true, label: 'El estado' },
  responsable: updateRules.responsable,
  solucion: { type: 'string', maxLength: 2000, label: 'La solución' },
  comentario: { type: 'string', maxLength: 255, label: 'El comentario' },
  usuario_id: { type: 'int', min: 1, label: 'El usuario' }
}

// Cada usuario solo ve sus solicitudes; el personal administrativo y el admin ven todas.
function assertCanView(req, request) {
  if (!canSeeAll(req.user) && request.usuario_id !== req.user.id) {
    throw forbidden('No tienes permiso para ver esta solicitud.')
  }
}

async function findOrFail(idParam) {
  const request = await RequestModel.findById(parseId(idParam))
  if (!request) throw notFound('Solicitud no encontrada.', 'REQUEST_NOT_FOUND')
  return request
}

export const RequestController = {
  list: asyncHandler(async (req, res) => {
    const filters = validate(req.query, filterRules)
    if (!canSeeAll(req.user)) filters.usuario_id = req.user.id
    res.json(await RequestModel.findAll(filters))
  }),

  getById: asyncHandler(async (req, res) => {
    const request = await findOrFail(req.params.id)
    assertCanView(req, request)
    res.json(request)
  }),

  history: asyncHandler(async (req, res) => {
    const request = await findOrFail(req.params.id)
    assertCanView(req, request)
    res.json(await RequestModel.history(request.id))
  }),

  create: asyncHandler(async (req, res) => {
    const data = validate(req.body, createRules)
    // Por defecto la solicitud queda a nombre de quien la registra. Solo el personal puede
    // registrarla a nombre de otra persona.
    if (data.usuario_id === null) data.usuario_id = req.user.id
    else if (!isStaff(req.user) && data.usuario_id !== req.user.id) {
      throw forbidden('No puedes registrar solicitudes a nombre de otro usuario.')
    }
    const request = await RequestModel.create(data)
    await notifyUser({
      usuario_id: request.usuario_id,
      titulo: 'Solicitud registrada',
      mensaje: `Tu solicitud ${request.codigo} (${request.tipo}) fue registrada correctamente.`,
      tipo: 'solicitud',
      entidad: 'solicitud',
      entidad_id: request.id
    })
    res.status(201).json(request)
  }),

  // PUT: reemplaza los datos editables de la solicitud (no cambia el estado).
  update: asyncHandler(async (req, res) => {
    const request = await findOrFail(req.params.id)
    // El solicitante solo puede corregir su solicitud mientras nadie la haya empezado a revisar.
    if (!isStaff(req.user)) {
      if (request.usuario_id !== req.user.id) throw forbidden('Solo puedes editar tus propias solicitudes.')
      if (request.estado !== 'Registrada') {
        throw forbidden('Solo puedes editar tu solicitud mientras esté en estado Registrada.')
      }
    }
    if (FINAL_STATES.includes(request.estado)) {
      throw conflict(`Una solicitud ${request.estado.toLowerCase()} no se puede modificar.`, 'REQUEST_CLOSED')
    }
    const data = validate(req.body, updateRules)
    // El responsable lo asigna el personal, no el solicitante.
    const fields = isStaff(req.user) ? data : { ...data, responsable: request.responsable }
    res.json(await RequestModel.update(request.id, fields))
  }),

  // PATCH /:id/estado: cambia el estado solo si la transición está permitida (ver rules/requestRules.js).
  updateStatus: asyncHandler(async (req, res) => {
    const request = await findOrFail(req.params.id)
    const data = validate(req.body, statusRules)
    checkTransition(request, data)

    // El historial registra quién hizo el cambio: el usuario de la sesión, no uno enviado por el cliente.
    const rejected = data.estado === 'Rechazada'
    const updated = await RequestModel.updateStatus(request.id, {
      anterior: request.estado,
      ...data,
      // Al denegar, el motivo también queda como respuesta final de la solicitud.
      solucion: rejected ? data.comentario : data.solucion,
      usuario_id: req.user.id
    })
    await notifyUser({
      usuario_id: updated.usuario_id,
      titulo: rejected ? 'Solicitud denegada' : 'Actualización de tu solicitud',
      mensaje: rejected
        ? `Tu solicitud ${updated.codigo} fue denegada. Motivo: ${data.comentario}`.slice(0, 255)
        : `Tu solicitud ${updated.codigo} pasó al estado ${updated.estado}.`,
      tipo: 'solicitud',
      entidad: 'solicitud',
      entidad_id: updated.id
    })
    res.json(updated)
  }),

  remove: asyncHandler(async (req, res) => {
    const request = await findOrFail(req.params.id)
    await RequestModel.remove(request.id)
    res.status(204).send()
  })
}
