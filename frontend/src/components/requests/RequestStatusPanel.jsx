import { useState } from 'react'
import { endpoints } from '../../api/client.js'
import './RequestStatusPanel.css'

const MOTIVO_DENEGAR = { name: 'comentario', label: 'Motivo de la denegación', multiline: true, maxLength: 255 }

/**
 * Qué puede hacer el personal con una solicitud según su estado actual.
 * El backend es quien valida de verdad cada cambio (requests-service/src/rules/requestRules.js);
 * esta tabla solo decide qué botones mostrar. Los estados finales (Cerrada, Rechazada) no tienen acciones.
 */
export const STATUS_ACTIONS = {
  'Registrada': [
    { label: 'Validar solicitud', estado: 'En revisión', variant: 'primary' },
    { label: 'Denegar', estado: 'Rechazada', variant: 'danger', field: MOTIVO_DENEGAR }
  ],
  'En revisión': [
    {
      label: 'Asignar', estado: 'Asignada', variant: 'primary',
      field: { name: 'responsable', label: 'Responsable de atender la solicitud', maxLength: 150 }
    },
    { label: 'Denegar', estado: 'Rechazada', variant: 'danger', field: MOTIVO_DENEGAR }
  ],
  'Asignada': [{ label: 'Iniciar atención', estado: 'En proceso', variant: 'primary' }],
  'En proceso': [
    {
      label: 'Marcar como resuelta', estado: 'Resuelta', variant: 'primary',
      field: { name: 'solucion', label: 'Solución aplicada', multiline: true, maxLength: 2000 }
    }
  ],
  'Resuelta': [
    { label: 'Cerrar solicitud', estado: 'Cerrada', variant: 'primary' },
    {
      label: 'Reabrir', estado: 'En proceso', variant: 'secondary',
      field: { name: 'comentario', label: 'Motivo de la reapertura', multiline: true, maxLength: 255 }
    }
  ]
}

/**
 * RequestStatusPanel — panel del personal (administrativo y admin) para validar, denegar
 * y avanzar una solicitud. Pide el dato que cada cambio exige (motivo, responsable o solución).
 */
export default function RequestStatusPanel({ request, onChanged }) {
  const actions = STATUS_ACTIONS[request.estado] ?? []
  const [selected, setSelected] = useState(null)
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (actions.length === 0) return null

  const send = async (action, extra = {}) => {
    setSubmitting(true)
    setError(null)
    try {
      const { data } = await endpoints.updateRequestStatus(request.id, { estado: action.estado, ...extra })
      setSelected(null)
      setValue('')
      onChanged?.(data)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudo cambiar el estado. Verifica que el backend esté corriendo.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const choose = (action) => {
    setError(null)
    if (!action.field) return send(action)
    setSelected(action)
    // Si la solicitud ya tiene ese dato (por ejemplo el responsable), se propone para confirmarlo.
    setValue(action.field.name === 'comentario' ? '' : request[action.field.name] ?? '')
  }

  const cancel = () => {
    setSelected(null)
    setValue('')
    setError(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    send(selected, { [selected.field.name]: value.trim() })
  }

  const field = selected?.field

  return (
    <section className="status-panel" aria-labelledby="status-panel-title">
      <h2 id="status-panel-title" className="status-panel__title">Gestionar solicitud</h2>

      {!selected && (
        <div className="status-panel__actions">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`status-panel__button status-panel__button--${action.variant}`}
              onClick={() => choose(action)}
              disabled={submitting}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <form className="status-panel__form" onSubmit={handleSubmit}>
          <label className="status-panel__label" htmlFor="status-panel-field">{field.label}</label>
          {field.multiline ? (
            <textarea
              id="status-panel-field"
              className="status-panel__input"
              rows={3}
              maxLength={field.maxLength}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          ) : (
            <input
              id="status-panel-field"
              className="status-panel__input"
              type="text"
              maxLength={field.maxLength}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          )}
          <div className="status-panel__actions">
            <button
              type="submit"
              className={`status-panel__button status-panel__button--${selected.variant}`}
              disabled={submitting || !value.trim()}
            >
              {submitting ? 'Guardando...' : `Confirmar: ${selected.label}`}
            </button>
            <button type="button" className="status-panel__button status-panel__button--secondary" onClick={cancel} disabled={submitting}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="status-panel__error" role="alert">{error}</p>
      )}
    </section>
  )
}
