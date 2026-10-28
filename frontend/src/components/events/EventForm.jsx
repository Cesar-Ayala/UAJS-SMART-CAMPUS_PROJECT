import { useState } from 'react'
import { endpoints } from '../../api/client.js'
import { todayKey } from '../../utils/dates.js'
import './EventForm.css'

// El campo <input type="time"> entrega '14:30'; el backend espera '2:30 PM'.
export function to12Hour(value) {
  if (!value) return null
  const [hour, minute] = value.split(':').map(Number)
  return `${hour % 12 === 0 ? 12 : hour % 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`
}

const EMPTY = { nombre: '', fecha: '', hora: '', hora_fin: '', lugar: '', descripcion: '' }

/**
 * EventForm — formulario para publicar un evento (docente, administrativo y admin).
 * El backend valida las fechas y horas, y avisa a los usuarios activos del evento nuevo.
 */
export default function EventForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const setField = (name) => (e) => setForm((current) => ({ ...current, [name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { data } = await endpoints.createEvent({
        nombre: form.nombre.trim(),
        fecha: form.fecha,
        hora: to12Hour(form.hora),
        hora_fin: to12Hour(form.hora_fin),
        lugar: form.lugar.trim(),
        descripcion: form.descripcion.trim()
      })
      onCreated(data)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo publicar el evento. Verifica que el backend esté corriendo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <h2 className="event-form__title">Publicar evento</h2>

      <label className="event-form__field">
        <span className="event-form__label">Nombre del evento</span>
        <input className="event-form__input" value={form.nombre} onChange={setField('nombre')} maxLength={150} required />
      </label>

      <div className="event-form__row">
        <label className="event-form__field">
          <span className="event-form__label">Fecha</span>
          <input className="event-form__input" type="date" value={form.fecha} min={todayKey()} onChange={setField('fecha')} required />
        </label>
        <label className="event-form__field">
          <span className="event-form__label">Hora de inicio</span>
          <input className="event-form__input" type="time" value={form.hora} onChange={setField('hora')} required />
        </label>
        <label className="event-form__field">
          <span className="event-form__label">Hora de fin (opcional)</span>
          <input className="event-form__input" type="time" value={form.hora_fin} onChange={setField('hora_fin')} />
        </label>
      </div>

      <label className="event-form__field">
        <span className="event-form__label">Lugar</span>
        <input className="event-form__input" value={form.lugar} onChange={setField('lugar')} maxLength={150} required />
      </label>

      <label className="event-form__field">
        <span className="event-form__label">Descripción (opcional)</span>
        <textarea className="event-form__input" rows={3} value={form.descripcion} onChange={setField('descripcion')} maxLength={2000} />
      </label>

      {error && <p className="event-form__error" role="alert">{error}</p>}

      <div className="event-form__actions">
        <button type="submit" className="event-form__button event-form__button--primary" disabled={saving}>
          {saving ? 'Publicando...' : 'Publicar evento'}
        </button>
        <button type="button" className="event-form__button" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
