import StatWidget from './StatWidget.jsx'
import './DashboardPanel.css'

export default function DashboardPanel({ requests = [], reservations = [], notifications = [], events = [] }) {
  const pendientes = requests.filter((r) => r.estado !== 'Resuelta' && r.estado !== 'Cerrada').length
  const noLeidas = notifications.filter((n) => !n.leida).length

  return (
    <section className="dashboard-panel">
      <StatWidget icon="📄" label="Solicitudes pendientes" value={pendientes} />
      <StatWidget icon="📅" label="Reservas realizadas" value={reservations.length} />
      <StatWidget icon="🔔" label="Notificaciones no leídas" value={noLeidas} />
      <StatWidget icon="🎓" label="Eventos próximos" value={events.length} />
    </section>
  )
}
