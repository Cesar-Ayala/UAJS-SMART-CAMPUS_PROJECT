import useFetch from '../hooks/useFetch.js'
import { endpoints } from '../api/client.js'
import { mockRequests } from '../data/mockData.js'
import RequestCard from '../components/cards/RequestCard.jsx'
import Loader from '../components/common/Loader.jsx'

export default function Requests() {
  const { data: requests, loading } = useFetch(endpoints.requests, mockRequests, [])

  return (
    <div>
      <h1 className="page__title">Mis solicitudes</h1>
      <p className="page__subtitle">Consulta el estado de tus solicitudes registradas.</p>

      {loading ? (
        <Loader label="Cargando solicitudes..." />
      ) : (
        <div className="grid">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}
