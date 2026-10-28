import './StatusBadge.css'

const STATUS_MODIFIER = {
  'Registrada': 'status-badge--neutral',
  'En revisión': 'status-badge--info',
  'Asignada': 'status-badge--info',
  'En proceso': 'status-badge--warning',
  'Confirmada': 'status-badge--warning',
  'Pendiente': 'status-badge--neutral',
  'Resuelta': 'status-badge--success',
  'Cerrada': 'status-badge--success',
  'Rechazada': 'status-badge--danger',
  'Cancelada': 'status-badge--danger'
}

export default function StatusBadge({ status }) {
  const modifier = STATUS_MODIFIER[status] || 'status-badge--neutral'
  return <span className={`status-badge ${modifier}`}>{status}</span>
}
