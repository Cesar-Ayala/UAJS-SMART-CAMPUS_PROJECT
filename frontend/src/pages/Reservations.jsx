import { useState } from 'react'
import useFetch from '../hooks/useFetch.js'
import { endpoints } from '../api/client.js'
import { mockReservations, mockResources } from '../data/mockData.js'
import ReservationCard from '../components/cards/ReservationCard.jsx'
import Loader from '../components/common/Loader.jsx'

export default function Reservations() {
  const { data: reservations, loading: loadingReservations } = useFetch(
    endpoints.reservations, mockReservations, []
  )
  const { data: resources, loading: loadingResources } = useFetch(
    endpoints.resources, mockResources, []
  )
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <h1 className="page__title">Reservas</h1>
      <p className="page__subtitle">Consulta y solicita la reserva de recursos institucionales.</p>

      <h3>Mis reservas</h3>
      {loadingReservations ? (
        <Loader />
      ) : (
        <div className="grid" style={{ marginBottom: 32 }}>
          {reservations.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}

      <h3>Recursos disponibles</h3>
      {loadingResources ? (
        <Loader />
      ) : (
        <ul className="grid">
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="request-card"
              style={{ opacity: resource.disponible ? 1 : 0.5, cursor: 'pointer' }}
              onClick={() => resource.disponible && setSelected(resource)}
            >
              <strong>{resource.nombre}</strong>
              <p style={{ margin: '4px 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {resource.tipo} · {resource.ubicacion}
              </p>
              <span style={{ fontSize: '0.78rem' }}>
                {resource.disponible ? '✅ Disponible' : '⛔ No disponible'}
              </span>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <p style={{ marginTop: 16 }}>
          Solicitud de reserva para <strong>{selected.nombre}</strong> lista para enviarse
          (conectar con <code>endpoints.createRequest</code> / endpoint de reservas del backend).
        </p>
      )}
    </div>
  )
}
