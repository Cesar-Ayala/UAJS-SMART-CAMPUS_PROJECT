import { ResourceModel } from '../models/resourceModel.js'
import { asyncHandler } from '../../../../shared/http.js'
import { notFound } from '../../../../shared/errors.js'
import { parseId, validate } from '../../../../shared/validate.js'

const TIPOS = ['Laboratorio', 'Sala', 'Equipo', 'Espacio']
const ESTADOS = ['Activo', 'Mantenimiento', 'Inactivo']

const filterRules = {
  tipo: { type: 'enum', values: TIPOS, label: 'El tipo' },
  estado: { type: 'enum', values: ESTADOS, label: 'El estado' },
  disponible: { type: 'boolean', label: 'La disponibilidad' }
}

const baseRules = {
  codigo: {
    type: 'string', required: true, maxLength: 50, label: 'El código',
    pattern: /^[A-Za-z0-9_-]+$/,
    patternMessage: 'solo puede contener letras, números, guiones y guiones bajos.'
  },
  nombre: { type: 'string', required: true, maxLength: 150, label: 'El nombre' },
  tipo: { type: 'enum', values: TIPOS, required: true, label: 'El tipo' },
  ubicacion: { type: 'string', maxLength: 150, label: 'La ubicación' },
  descripcion: { type: 'string', maxLength: 1000, label: 'La descripción' }
}

const createRules = {
  ...baseRules,
  estado: { type: 'enum', values: ESTADOS, default: 'Activo', label: 'El estado' },
  disponible: { type: 'boolean', default: true, label: 'La disponibilidad' }
}

// En PUT, si no se envían estado o disponible se conservan los actuales.
const updateRules = {
  ...baseRules,
  estado: { type: 'enum', values: ESTADOS, label: 'El estado' },
  disponible: { type: 'boolean', label: 'La disponibilidad' }
}

async function findOrFail(idParam) {
  const resource = await ResourceModel.findById(parseId(idParam))
  if (!resource) throw notFound('Recurso no encontrado.', 'RESOURCE_NOT_FOUND')
  return resource
}

export const ResourceController = {
  list: asyncHandler(async (req, res) => {
    res.json(await ResourceModel.findAll(validate(req.query, filterRules)))
  }),

  getById: asyncHandler(async (req, res) => {
    res.json(await findOrFail(req.params.id))
  }),

  create: asyncHandler(async (req, res) => {
    const data = validate(req.body, createRules)
    res.status(201).json(await ResourceModel.create(data))
  }),

  update: asyncHandler(async (req, res) => {
    const resource = await findOrFail(req.params.id)
    const data = validate(req.body, updateRules)
    res.json(
      await ResourceModel.update(resource.id, {
        ...data,
        estado: data.estado ?? resource.estado,
        disponible: data.disponible ?? Boolean(resource.disponible)
      })
    )
  }),

  updateAvailability: asyncHandler(async (req, res) => {
    const resource = await findOrFail(req.params.id)
    const { disponible } = validate(req.body, {
      disponible: { type: 'boolean', required: true, label: 'La disponibilidad' }
    })
    res.json(await ResourceModel.setAvailability(resource.id, disponible))
  }),

  // Si el recurso tiene reservas, la base lo impide y el manejador central responde 409.
  remove: asyncHandler(async (req, res) => {
    const resource = await findOrFail(req.params.id)
    await ResourceModel.remove(resource.id)
    res.status(204).send()
  })
}
