import StatusBadge from '../common/StatusBadge.jsx'
import './ReservationCard.css'

export default function ReservationCard({ reservation }) {
  return (
    <div className="reservation-card">
      <div className="reservation-card__header">
        <h3 className="reservation-card__title">{reservation.recurso}</h3>
        <StatusBadge status={reservation.estado} />
      </div>
      <p className="reservation-card__meta">{reservation.fecha} · {reservation.hora}</p>
    </div>
  )
}
