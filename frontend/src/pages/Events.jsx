import useFetch from '../hooks/useFetch.js'
import { endpoints } from '../api/client.js'
import { mockEvents } from '../data/mockData.js'
import EventCard from '../components/cards/EventCard.jsx'
import Loader from '../components/common/Loader.jsx'

export default function Events() {
  const { data: events, loading } = useFetch(endpoints.events, mockEvents, [])

  return (
    <div>
      <h1 className="page__title">Eventos y actividades</h1>
      <p className="page__subtitle">Actividades académicas e institucionales disponibles.</p>

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
