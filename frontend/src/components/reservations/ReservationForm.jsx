import { useState } from 'react'
import { endpoints } from '../../api/client.js'
import { useUser } from '../../context/UserContext.jsx'
import { formatDate, toDateKey, todayKey } from '../../utils/dates.js'
import './ReservationForm.css'

// Franjas de una hora, de 7:00 AM a 7:00 PM, con el mismo formato que usan los datos de prueba.
function slotLabel(hour24) {
  const suffix = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  return `${hour12}:00 ${suffix}`
}
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => slotLabel(7 + i))

/**
 * ReservationForm — formulario para reservar un recurso.
 * Flujo: elegir fecha -> consultar disponibilidad (las horas ocupadas se
 * deshabilitan) -> elegir hora -> validar -> crear la reserva.
 *
 * Props:
 *  - resource: recurso elegido.
 *  - reservations: reservas existentes, para consultar la disponibilidad.
 *  - onCreated: se llama con { resource, fecha, hora } cuando la API confirma.
 *  - onCancel: cierra el formulario sin guardar.
 */
export default function ReservationForm({ resource, reservations, onCreated, onCancel }) {
  const { user } = useUser()
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Horas ya ocupadas para este recurso en la fecha elegida (las canceladas no cuentan).
  const takenSlots = new Set(
    reservations
      .filter(
        (r) =>
          r.recurso === resource.nombre &&
          r.estado !== 'Cancelada' &&
          toDateKey(r.fecha) === fecha
      )
      .map((r) => r.hora)
  )

  const handleDateChange = (e) => {
    setFecha(e.target.value)
    setHora('') // al cambiar de día, la disponibilidad es otra
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (fecha < todayKey()) {
      setError('Elige una fecha de hoy en adelante.')
      return
    }
    if (takenSlots.has(hora)) {
      setError(
        `${resource.nombre} ya está reservado el ${formatDate(fecha)} a las ${hora}. Elige otra hora.`
      )
      return
    }

    setSubmitting(true)
    try {
      await endpoints.createReservation({
        recurso_id: resource.id,
        usuario_id: user?.id,
        fecha,
        hora
      })
      onCreated({ resource, fecha, hora })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'No se pudo registrar la reserva. Verifica que el backend esté corriendo.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="reservation-form" onSubmit={handleSubmit}>
      <h2 className="reservation-form__title">Reservar {resource.nombre}</h2>
      <p className="reservation-form__meta">
        {resource.tipo} · {resource.ubicacion}
      </p>

      <label className="reservation-form__field">
        <span className="reservation-form__label">Fecha</span>
        <input
          className="reservation-form__input"
          type="date"
          value={fecha}
          min={todayKey()}
          onChange={handleDateChange}
          required
        />
      </label>

      <label className="reservation-form__field">
        <span className="reservation-form__label">Hora</span>
        <select
          className="reservation-form__input"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          disabled={!fecha}
          required
        >
          <option value="" disabled>
            {fecha ? 'Selecciona una hora' : 'Primero elige la fecha'}
          </option>
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot} disabled={takenSlots.has(slot)}>
              {takenSlots.has(slot) ? `${slot} (ocupado)` : slot}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p className="reservation-form__error" role="alert">
          {error}
        </p>
      )}

      <div className="reservation-form__actions">
        <button type="submit" className="reservation-form__submit" disabled={submitting}>
          {submitting ? 'Reservando...' : 'Confirmar reserva'}
        </button>
        <button
          type="button"
          className="reservation-form__cancel"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
