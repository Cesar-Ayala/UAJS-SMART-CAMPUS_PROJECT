import { Link } from 'react-router-dom'
import StatusBadge from '../common/StatusBadge.jsx'
import './RequestCard.css'

export default function RequestCard({ request }) {
  return (
    <Link to={`/solicitudes/${request.id}`} className="request-card">
      <div className="request-card__header">
        <span className="request-card__id">{request.id}</span>
        <StatusBadge status={request.estado} />
      </div>
      <h3 className="request-card__title">{request.tipo}</h3>
      <p className="request-card__meta">{request.dependencia} · {request.fecha}</p>
    </Link>
  )
}
