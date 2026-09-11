import { useParams, Link } from 'react-router-dom'
import { mockServices } from '../data/mockData.js'

const SERVICE_ACTIONS = {
  solicitudes: { label: 'Ver mis solicitudes', to: '/solicitudes' },
  reservas: { label: 'Ver reservas disponibles', to: '/reservas' },
  eventos: { label: 'Ver eventos y actividades', to: '/eventos' },
  notificaciones: { label: 'Ver notificaciones', to: '/notificaciones' }
}

export default function ServiceDetail() {
  const { id } = useParams()
  const service = mockServices.find((s) => s.id === id)

  if (!service) return <p>Servicio no encontrado.</p>

  const action = SERVICE_ACTIONS[id]

  return (
    <div>
      <span className="page__subtitle">{service.categoria}</span>
      <h1 className="page__title">{service.nombre}</h1>
      <p>{service.descripcion}</p>

      {action && (
        <Link to={action.to} className="landing__cta" style={{ marginTop: 16, display: 'inline-block' }}>
          {action.label}
        </Link>
      )}
    </div>
  )
}
