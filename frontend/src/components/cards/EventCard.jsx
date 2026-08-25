import './EventCard.css'

export default function EventCard({ event }) {
  return (
    <article className="event-card">
      <p className="event-card__date">{event.fecha} · {event.hora}</p>
      <h3 className="event-card__title">{event.nombre}</h3>
      <p className="event-card__place">📍 {event.lugar}</p>
      <p className="event-card__description">{event.descripcion}</p>
    </article>
  )
}
