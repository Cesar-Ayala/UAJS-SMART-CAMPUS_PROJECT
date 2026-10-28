import { useState } from 'react'
import useFetch from '../hooks/useFetch.js'
import usePermissions from '../hooks/usePermissions.js'
import { endpoints } from '../api/client.js'
import { mockEvents } from '../data/mockData.js'
import EventCard from '../components/cards/EventCard.jsx'
import EventForm from '../components/events/EventForm.jsx'
import Loader from '../components/common/Loader.jsx'
import './Events.css'

export default function Events() {
  const { data: events, loading, reload } = useFetch(endpoints.events, mockEvents, [])
  const { canPublishEvents } = usePermissions()
  const [showForm, setShowForm] = useState(false)
  const [notice, setNotice] = useState(null)

  const handleCreated = (event) => {
    setShowForm(false)
    setNotice(`Evento "${event.nombre}" publicado. Se avisó a los usuarios activos.`)
    reload()
  }

  return (
    <div>
      <h1 className="page__title">Eventos y actividades</h1>
      <p className="page__subtitle">Actividades académicas e institucionales disponibles.</p>

      {/* Docentes, personal administrativo y administradores pueden publicar eventos. */}
      {canPublishEvents && !showForm && (
        <button type="button" className="events__publish" onClick={() => { setShowForm(true); setNotice(null) }}>
          Publicar evento
        </button>
      )}

      {notice && <p className="events__notice" role="status">{notice}</p>}

      {showForm && <EventForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}

      {loading ? (
        <Loader />
      ) : (
        <div className="grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
