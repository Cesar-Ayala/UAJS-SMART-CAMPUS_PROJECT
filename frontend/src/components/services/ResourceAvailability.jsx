import useFetch from '../../hooks/useFetch.js'
import { endpoints } from '../../api/client.js'
import { mockResources } from '../../data/mockData.js'
import Loader from '../common/Loader.jsx'
import './ResourceAvailability.css'

/**
 * ResourceAvailability — listado de solo lectura de los recursos
 * institucionales con su disponibilidad (se usa en el detalle de
 * los servicios Reservas y Recursos).
 */
export default function ResourceAvailability() {
  const { data: resources, loading } = useFetch(endpoints.resources, mockResources, [])

  if (loading) return <Loader />

  return (
    <ul className="resource-availability">
      {resources.map((resource) => {
        const available = Boolean(resource.disponible)
        return (
          <li key={resource.id} className="resource-availability__item">
            <div className="resource-availability__info">
              <span className="resource-availability__name">{resource.nombre}</span>
              <span className="resource-availability__meta">
                {resource.tipo} · {resource.ubicacion}
              </span>
            </div>
            <span
              className={`resource-availability__status resource-availability__status--${
                available ? 'available' : 'unavailable'
              }`}
            >
              {available ? 'Disponible' : 'No disponible'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
