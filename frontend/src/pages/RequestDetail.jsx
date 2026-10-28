import { useParams, Link } from 'react-router-dom'
import useFetch from '../hooks/useFetch.js'
import { endpoints } from '../api/client.js'
import { mockRequests, requestStatusFlow } from '../data/mockData.js'
import { formatDate } from '../utils/dates.js'
import usePermissions from '../hooks/usePermissions.js'
import StatusBadge from '../components/common/StatusBadge.jsx'
import RequestStatusPanel from '../components/requests/RequestStatusPanel.jsx'
import Loader from '../components/common/Loader.jsx'
import './RequestDetail.css'

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '')

export default function RequestDetail() {
  const { id } = useParams()
  const { canManageRequests } = usePermissions()

  // Pide solo esta solicitud al backend (GET /api/requests/:id).
  // Si el backend no responde, cae a los datos de prueba (si existe una con ese id).
  const { data: request, loading, error, reload } = useFetch(
    () => endpoints.requestById(id),
    mockRequests.find((r) => String(r.id) === String(id)) || null,
    [id]
  )

  if (loading) return <Loader label="Cargando solicitud..." />

  const backLink = (
    <Link to="/solicitudes" className="request-detail__back">← Volver a solicitudes</Link>
  )

  // El backend respondió que esa solicitud no existe.
  if (error?.response?.status === 404) {
    return (
      <div className="request-detail">
        {backLink}
        <h1 className="page__title">Solicitud no encontrada</h1>
        <p>La solicitud {id} no existe o ya fue eliminada.</p>
      </div>
    )
  }

  // No hubo respuesta del backend y tampoco hay datos de prueba para mostrar.
  if (!request) {
    return (
      <div className="request-detail">
        {backLink}
        <h1 className="page__title">No pudimos cargar la solicitud</h1>
        <p className="request-detail__error" role="alert">
          Verifica que el backend esté corriendo e inténtalo de nuevo.
        </p>
        <button type="button" className="request-detail__retry" onClick={reload}>
          Reintentar
        </button>
      </div>
    )
  }

  const currentIndex = requestStatusFlow.indexOf(request.estado)
  const rejected = request.estado === 'Rechazada'

  const facts = [
    ['Dependencia', request.dependencia],
    ['Fecha', formatDate(request.fecha)],
    ['Prioridad', capitalize(request.prioridad)],
    ['Responsable', request.responsable || 'Sin asignar']
  ].filter(([, value]) => value)

  return (
    <div className="request-detail">
      {backLink}

      {error && (
        <p className="request-detail__notice" role="status">
          No se pudo conectar con el servidor: se muestran datos de ejemplo.
        </p>
      )}

      <h1 className="page__title">{request.tipo}</h1>
      <p className="page__subtitle">Solicitud {request.id}</p>

      <dl className="request-detail__facts">
        {facts.map(([label, value]) => (
          <div key={label} className="request-detail__fact">
            <dt className="request-detail__fact-label">{label}</dt>
            <dd className="request-detail__fact-value">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="request-detail__description">{request.descripcion}</p>

      {request.solucion && (
        <div className={`request-detail__answer${rejected ? ' request-detail__answer--denied' : ''}`}>
          <h2 className="request-detail__heading">{rejected ? 'Motivo de la denegación' : 'Solución'}</h2>
          <p className="request-detail__answer-text">{request.solucion}</p>
        </div>
      )}

      <h2 className="request-detail__heading">
        Estado actual: <StatusBadge status={request.estado} />
      </h2>

      {/* Una solicitud denegada terminó su recorrido: no tiene línea de estados. */}
      {!rejected && (
      <ol className="status-flow">
        {requestStatusFlow.map((step, index) => {
          let modifier = ''
          if (index < currentIndex) modifier = ' status-flow__step--done'
          if (index === currentIndex) modifier = ' status-flow__step--done status-flow__step--current'
          return (
            <li
              key={step}
              className={`status-flow__step${modifier}`}
              aria-current={index === currentIndex ? 'step' : undefined}
            >
              {step}
            </li>
          )
        })}
      </ol>
      )}

      {canManageRequests && <RequestStatusPanel request={request} onChanged={reload} />}
    </div>
  )
}
