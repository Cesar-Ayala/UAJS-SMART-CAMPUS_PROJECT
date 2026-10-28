import useFetch from '../hooks/useFetch.js'
import { endpoints } from '../api/client.js'
import { useUser } from '../context/UserContext.jsx'
import {
  mockServices,
  mockRequests,
  mockReservations,
  mockNotifications,
  mockEvents
} from '../data/mockData.js'
import ServiceCard from '../components/cards/ServiceCard.jsx'
import DashboardPanel from '../components/dashboard/DashboardPanel.jsx'
import Loader from '../components/common/Loader.jsx'
import './Home.css'

export default function Home() {
  const { user } = useUser()
  const services = mockServices

  const { data: requests, loading } = useFetch(endpoints.requests, mockRequests, [])
  const { data: reservations } = useFetch(endpoints.reservations, mockReservations, [])
  const { data: notifications } = useFetch(endpoints.notifications, mockNotifications, [])
  const { data: events } = useFetch(endpoints.events, mockEvents, [])

  const nombreUsuario = user?.nombre || 'Estudiante'
  const rolUsuario = user?.rol || 'Ingeniería de Sistemas'

  return (
    <div className="home-container">
      {/* Banner de Bienvenida */}
      <section className="welcome-banner">
        <div className="welcome-banner__content">
          <span className="welcome-banner__badge">UAJS Smart Campus</span>
          <h1 className="welcome-banner__title">¡Hola, {nombreUsuario}! </h1>
          <p className="welcome-banner__subtitle">
            Bienvenido a tu portal de servicios universitarios ({rolUsuario}). Consulta tus trámites, reservas y actividades en un solo lugar.
          </p>
        </div>
      </section>

      {/* Resumen de Estadísticas / Widgets */}
      <section className="dashboard-section">
        <h2 className="section-title">Resumen de Actividad</h2>
        <DashboardPanel
          requests={requests}
          reservations={reservations}
          notifications={notifications}
          events={events}
        />
      </section>

      {/* Servicios Disponibles / Accesos Directos */}
      <section className="services-section">
        <div className="services-header">
          <h2 className="section-title">Servicios Universitarios</h2>
          <span className="services-count">{services.length} Módulos activos</span>
        </div>

        {loading ? (
          <Loader label="Cargando servicios del campus..." />
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}