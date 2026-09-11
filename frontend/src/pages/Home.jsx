import useFetch from '../hooks/useFetch.js'
import { endpoints } from '../api/client.js'
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

export default function Home() {
  // El catálogo de "servicios" (tarjetas del panel) es un dato de UI local,
  // no proviene de un microservicio: no es uno de los 6 exigidos en el Entregable 1.
  const services = mockServices

  const { data: requests, loading } = useFetch(endpoints.requests, mockRequests, [])
  const { data: reservations } = useFetch(endpoints.reservations, mockReservations, [])
  const { data: notifications } = useFetch(endpoints.notifications, mockNotifications, [])
  const { data: events } = useFetch(endpoints.events, mockEvents, [])

  return (
    <div>
      <h1 className="page__title">Panel principal</h1>
      <p className="page__subtitle">Consulta tus servicios universitarios en un solo lugar.</p>

      <DashboardPanel
        requests={requests}
        reservations={reservations}
        notifications={notifications}
        events={events}
      />


      {loading ? (
        <Loader label="Cargando..." />
      ) : (
        <div className="grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
