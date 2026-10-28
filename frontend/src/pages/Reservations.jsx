import { useEffect, useRef, useState } from 'react'
import useFetch from '../hooks/useFetch.js'
import { endpoints } from '../api/client.js'
import { mockReservations, mockResources } from '../data/mockData.js'
import { formatDate } from '../utils/dates.js'
import ReservationCard from '../components/cards/ReservationCard.jsx'
import ResourceCard from '../components/cards/ResourceCard.jsx'
import ReservationForm from '../components/reservations/ReservationForm.jsx'
import Loader from '../components/common/Loader.jsx'
import './Reservations.css'

export default function Reservations() {
  const {
    data: reservations,
    loading: loadingReservations,
    reload: reloadReservations
  } = useFetch(endpoints.reservations, mockReservations, [])
  const { data: resources, loading: loadingResources } = useFetch(
    endpoints.resources, mockResources, []
  )
  const [selected, setSelected] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const formRef = useRef(null)

  // Al elegir un recurso, lleva la vista hasta el formulario.
  useEffect(() => {
    if (!selected) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    formRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest'
    })
  }, [selected])

  const handleSelect = (resource) => {
    setConfirmation(null)
    setSelected(resource)
  }

  const handleCreated = ({ resource, fecha, hora }) => {
    setSelected(null)
    setConfirmation(
      `Reserva registrada: ${resource.nombre}, ${formatDate(fecha)} a las ${hora}. Quedó en estado Pendiente.`
    )
    reloadReservations()
  }

  return (
    <div>
      <h1 className="page__title">Reservas</h1>
      <p className="page__subtitle">Consulta y solicita la reserva de recursos institucionales.</p>

      {confirmation && (
        <p className="reservations__confirmation" role="status">
          {confirmation}
        </p>
      )}

      <h2 className="reservations__heading">Mis reservas</h2>
      {loadingReservations ? (
        <Loader />
      ) : reservations.length === 0 ? (
        <p className="reservations__empty">
          Todavía no hay reservas registradas. Elige un recurso disponible para crear la primera.
        </p>
      ) : (
        <div className="grid reservations__list">
          {reservations.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}

      <h2 className="reservations__heading">Recursos disponibles</h2>
      {loadingResources ? (
        <Loader />
      ) : (
        <ul className="grid">
          {resources.map((resource) => (
            <li key={resource.id}>
              <ResourceCard
                resource={resource}
                selected={selected?.id === resource.id}
                onSelect={handleSelect}
              />
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div ref={formRef} className="reservations__form">
          <ReservationForm
            key={selected.id}
            resource={selected}
            reservations={reservations}
            onCreated={handleCreated}
            onCancel={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  )
}
