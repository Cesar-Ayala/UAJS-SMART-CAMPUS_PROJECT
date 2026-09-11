import { Link } from 'react-router-dom'
import './ServiceCard.css'

// Mapea cada servicio directamente a la vista que le corresponde,
// para que estas tarjetas funcionen como accesos directos reales
// (reemplazan lo que antes hacía la barra de navegación superior).
const SERVICE_ROUTES = {
  solicitudes: '/solicitudes',
  reservas: '/reservas',
  recursos: '/reservas',
  eventos: '/eventos',
  notificaciones: '/notificaciones',
  pqrs: '/solicitudes/nueva'
}

export default function ServiceCard({ service }) {
  const destino = SERVICE_ROUTES[service.id] || `/servicios/${service.id}`

  return (
    <Link to={destino} className="service-card">
      <span className="service-card__category">{service.categoria}</span>
      <h3 className="service-card__title">{service.nombre}</h3>
      <p className="service-card__description">{service.descripcion}</p>
    </Link>
  )
}
