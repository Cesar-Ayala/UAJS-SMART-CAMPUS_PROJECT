import { useMemo, useState } from 'react'
import useFetch from '../hooks/useFetch.js'
import { endpoints } from '../api/client.js'
import {
  mockServices,
  mockRequests,
  mockReservations,
  mockNotifications,
  mockEvents
} from '../data/mockData.js'
import SearchBar from '../components/common/SearchBar.jsx'
import ServiceCard from '../components/cards/ServiceCard.jsx'
import DashboardPanel from '../components/dashboard/DashboardPanel.jsx'
import Loader from '../components/common/Loader.jsx'

export default function Home() {
  const [query, setQuery] = useState('')

  const { data: services, loading } = useFetch(endpoints.services, mockServices, [])
  const { data: requests } = useFetch(endpoints.requests, mockRequests, [])
  const { data: reservations } = useFetch(endpoints.reservations, mockReservations, [])
  const { data: notifications } = useFetch(endpoints.notifications, mockNotifications, [])
  const { data: events } = useFetch(endpoints.events, mockEvents, [])

  const filteredServices = useMemo(() => {
    if (!query) return services
    const q = query.toLowerCase()
    return services.filter(
      (s) => s.nombre.toLowerCase().includes(q) || s.categoria.toLowerCase().includes(q)
    )
  }, [services, query])

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
        <Loader label="Cargando servicios..." />
      ) : (
        <div className="grid">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
          {filteredServices.length === 0 && <p>No se encontraron servicios para "{query}".</p>}
        </div>
      )}
    </div>
  )
}
