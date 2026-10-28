import { useParams, Link } from 'react-router-dom'
import { mockServices } from '../data/mockData.js'
import usePermissions from '../hooks/usePermissions.js'
import ResourceAvailability from '../components/services/ResourceAvailability.jsx'
import ResourceManager from '../components/resources/ResourceManager.jsx'
import './ServiceDetail.css'

// Tipos de PQRS: cada uno abre el formulario de solicitud con el tipo ya elegido.
const PQRS_TYPES = [
  { type: 'Petición', text: 'solicita información o un trámite a una dependencia.' },
  { type: 'Queja', text: 'expresa tu inconformidad con un servicio o con la atención recibida.' },
  { type: 'Reclamo', text: 'pide que se revise o corrija una situación que te afecta.' },
  { type: 'Sugerencia', text: 'propone una mejora para la universidad.' }
]

const pqrsLink = (type) =>
  `/solicitudes/nueva?${new URLSearchParams({ tipo: `PQRS - ${type}` })}`

// Qué ofrece cada servicio: funcionalidades, acciones relacionadas y,
// en los servicios de recursos, el listado de recursos con su disponibilidad.
const SERVICE_DETAILS = {
  solicitudes: {
    features: [
      'Registrar una solicitud indicando tipo, dependencia y prioridad.',
      'Consultar el estado de cada una de tus solicitudes.',
      'Seguir su evolución: Registrada, En revisión, Asignada, En proceso, Resuelta y Cerrada.'
    ],
    actions: [
      { label: 'Registrar una solicitud', to: '/solicitudes/nueva' },
      { label: 'Ver mis solicitudes', to: '/solicitudes', secondary: true }
    ]
  },
  reservas: {
    features: [
      'Consultar los recursos que se pueden reservar.',
      'Ver qué horas están ocupadas antes de elegir.',
      'Registrar la reserva con fecha y hora.'
    ],
    actions: [{ label: 'Reservar un recurso', to: '/reservas' }],
    showResources: true
  },
  recursos: {
    features: [
      'Consultar salas, laboratorios y equipos de la universidad.',
      'Ver la ubicación y la disponibilidad de cada recurso.'
    ],
    actions: [{ label: 'Reservar un recurso', to: '/reservas' }],
    showResources: true
  },
  eventos: {
    features: [
      'Consultar conferencias, seminarios, talleres y actividades institucionales.',
      'Ver la fecha, la hora y el lugar de cada evento.'
    ],
    actions: [{ label: 'Ver eventos y actividades', to: '/eventos' }]
  },
  notificaciones: {
    features: [
      'Recibir avisos cuando cambia el estado de una solicitud.',
      'Ver la confirmación de tus reservas.',
      'Enterarte de nuevos eventos.'
    ],
    actions: [{ label: 'Ver notificaciones', to: '/notificaciones' }]
  },
  pqrs: {
    features: PQRS_TYPES.map(({ type, text }) => `${type}: ${text}`),
    actions: PQRS_TYPES.map(({ type }) => ({ label: `Registrar ${type.toLowerCase()}`, to: pqrsLink(type) }))
  }
}

export default function ServiceDetail() {
  const { id } = useParams()
  const { canManageResources } = usePermissions()
  const service = mockServices.find((s) => s.id === id)
  const details = SERVICE_DETAILS[id]

  if (!service || !details) {
    return (
      <div className="service-detail">
        <Link to="/inicio" className="service-detail__back">← Volver al inicio</Link>
        <h1 className="page__title">Servicio no encontrado</h1>
        <p>El servicio que buscas no existe o ya no está disponible.</p>
      </div>
    )
  }

  // Solo en el servicio Recursos, y solo para el personal, se muestra la gestión (alta, disponibilidad, baja).
  const manageResources = id === 'recursos' && canManageResources

  return (
    <div className="service-detail">
      <Link to="/inicio" className="service-detail__back">← Volver al inicio</Link>
      <span className="service-detail__category">{service.categoria}</span>
      <h1 className="page__title">{service.nombre}</h1>
      <p className="service-detail__lead">{service.descripcion}</p>

      <div className="service-detail__actions">
        {details.actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={`service-detail__action${action.secondary ? ' service-detail__action--secondary' : ''}`}
          >
            {action.label}
          </Link>
        ))}
      </div>

      <h2 className="service-detail__heading">
        {id === 'pqrs' ? 'Tipos de PQRS' : 'Qué puedes hacer'}
      </h2>
      <ul className="service-detail__features">
        {details.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>

      {details.showResources && (
        <>
          <h2 className="service-detail__heading">
            {manageResources ? 'Gestión de recursos' : 'Recursos y disponibilidad'}
          </h2>
          {manageResources ? <ResourceManager /> : <ResourceAvailability />}
        </>
      )}
    </div>
  )
}
