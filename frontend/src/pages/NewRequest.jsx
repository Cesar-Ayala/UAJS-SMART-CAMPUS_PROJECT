import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { endpoints } from '../api/client.js'
import './NewRequest.css'

const DEPENDENCIAS = [
  'Registro Académico',
  'Bienestar Universitario',
  'Laboratorios',
  'Biblioteca',
  'Sistemas y Tecnología'
]

const initialForm = {
  tipo: '',
  dependencia: DEPENDENCIAS[0],
  descripcion: '',
  prioridad: 'media'
}

export default function NewRequest() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // Si llega ?tipo=... (por ejemplo desde PQRS), el tipo queda precargado.
  const [form, setForm] = useState(() => ({ ...initialForm, tipo: searchParams.get('tipo') || '' }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await endpoints.createRequest(form)
      navigate('/solicitudes')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo registrar la solicitud. Verifica que el backend esté corriendo.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Link to="/solicitudes" className="page__subtitle">← Volver a solicitudes</Link>
      <h1 className="page__title">Nueva solicitud</h1>
      <p className="page__subtitle">Registra una solicitud universitaria. Quedará con estado "Registrada".</p>

      <form className="request-form" onSubmit={handleSubmit}>
        <label className="request-form__field">
          <span className="request-form__label">Tipo de solicitud</span>
          <input
            className="request-form__input"
            type="text"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            placeholder="Ej: Certificado académico"
            required
          />
        </label>

        <label className="request-form__field">
          <span className="request-form__label">Dependencia</span>
          <select
            className="request-form__input"
            name="dependencia"
            value={form.dependencia}
            onChange={handleChange}
          >
            {DEPENDENCIAS.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </label>

        <label className="request-form__field">
          <span className="request-form__label">Prioridad</span>
          <select
            className="request-form__input"
            name="prioridad"
            value={form.prioridad}
            onChange={handleChange}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </label>

        <label className="request-form__field">
          <span className="request-form__label">Descripción</span>
          <textarea
            className="request-form__input request-form__input--textarea"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={4}
            placeholder="Describe tu solicitud con el mayor detalle posible..."
            required
          />
        </label>

        {error && <p className="request-form__error">{error}</p>}

        <button type="submit" className="request-form__submit" disabled={submitting}>
          {submitting ? 'Enviando...' : 'Registrar solicitud'}
        </button>
      </form>
    </div>
  )
}
