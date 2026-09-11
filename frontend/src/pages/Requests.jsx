import { Link } from 'react-router-dom'
import useFetch from '../hooks/useFetch.js'
import { endpoints } from '../api/client.js'
import { mockRequests } from '../data/mockData.js'
import RequestCard from '../components/cards/RequestCard.jsx'
import Loader from '../components/common/Loader.jsx'

export default function Requests() {
  const { data: requests, loading, reload } = useFetch(endpoints.requests, mockRequests, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page__title">Mis solicitudes</h1>
          <p className="page__subtitle">Consulta el estado de tus solicitudes registradas.</p>
        </div>
        <Link to="/solicitudes/nueva" className="request-form__submit" style={{ textDecoration: 'none' }}>
          + Nueva solicitud
        </Link>
      </div>

      {loading ? (
        <Loader label="Cargando solicitudes..." />
      ) : (
        <div className="grid">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
          {requests.length === 0 && <p>Aún no tienes solicitudes registradas.</p>}
        </div>
      )}
    </div>
  )
}
