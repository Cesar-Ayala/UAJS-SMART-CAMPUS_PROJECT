import { useParams, Link } from 'react-router-dom'
import useFetch from '../hooks/useFetch.js'
import { endpoints } from '../api/client.js'
import { mockRequests, requestStatusFlow } from '../data/mockData.js'
import StatusBadge from '../components/common/StatusBadge.jsx'
import Loader from '../components/common/Loader.jsx'
import './RequestDetail.css'

export default function RequestDetail() {
  const { id } = useParams()
  const { data: requests, loading } = useFetch(endpoints.requests, mockRequests, [])

  if (loading) return <Loader label="Cargando solicitud..." />

  const request = requests.find((r) => String(r.id) === String(id))
  if (!request) return <p>Solicitud no encontrada. <Link to="/solicitudes">Volver</Link></p>

  const currentIndex = requestStatusFlow.indexOf(request.estado)

  return (
    <div>
      <Link to="/solicitudes" className="page__subtitle">← Volver a solicitudes</Link>
      <h1 className="page__title">{request.tipo}</h1>
      <p className="page__subtitle">
        {request.id} · {request.dependencia} · {request.fecha}
      </p>

      <p>{request.descripcion}</p>

      <h3>Estado actual: <StatusBadge status={request.estado} /></h3>

      <ol className="status-flow">
        {requestStatusFlow.map((step, index) => (
          <li
            key={step}
            className={
              'status-flow__step' +
              (index <= currentIndex ? ' status-flow__step--done' : '')
            }
          >
            {step}
          </li>
        ))}
      </ol>
    </div>
  )
}
