import { Link } from 'react-router-dom'
import './ServiceCard.css'

export default function ServiceCard({ service }) {
  return (
    <Link to={`/servicios/${service.id}`} className="service-card">
      <span className="service-card__category">{service.categoria}</span>
      <h3 className="service-card__title">{service.nombre}</h3>
      <p className="service-card__description">{service.descripcion}</p>
    </Link>
  )
}
