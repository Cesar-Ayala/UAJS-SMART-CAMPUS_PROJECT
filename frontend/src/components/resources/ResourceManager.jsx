import { useState } from 'react'
import useFetch from '../../hooks/useFetch.js'
import { endpoints } from '../../api/client.js'
import { mockResources } from '../../data/mockData.js'
import Loader from '../common/Loader.jsx'
import './ResourceManager.css'

const TYPES = ['Laboratorio', 'Sala', 'Equipo', 'Espacio']
const EMPTY_FORM = { codigo: '', nombre: '', tipo: 'Sala', ubicacion: '', descripcion: '' }

const messageOf = (err, fallback) => err.response?.data?.message || fallback

/**
 * ResourceManager — gestión de recursos para el personal administrativo y el admin:
 * agregar un recurso nuevo, activar/desactivar su disponibilidad y eliminarlo.
 * El backend valida cada operación (códigos únicos, tipos permitidos, recursos con reservas...).
 */
export default function ResourceManager() {
  const { data: resources, loading, reload } = useFetch(endpoints.resources, mockResources, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text }
  const [confirmingId, setConfirmingId] = useState(null)

  const setField = (name) => (e) => setForm((current) => ({ ...current, [name]: e.target.value }))

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      const { data } = await endpoints.createResource({
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        ubicacion: form.ubicacion.trim(),
        descripcion: form.descripcion.trim()
      })
      setNotice({ type: 'success', text: `Recurso "${data.nombre}" agregado.` })
      setForm(EMPTY_FORM)
      setShowForm(false)
      reload()
    } catch (err) {
      setNotice({ type: 'error', text: messageOf(err, 'No se pudo agregar el recurso. Verifica que el backend esté corriendo.') })
    } finally {
      setSaving(false)
    }
  }

  const run = async (action, successText) => {
    setNotice(null)
    try {
      await action()
      if (successText) setNotice({ type: 'success', text: successText })
      reload()
    } catch (err) {
      setNotice({ type: 'error', text: messageOf(err, 'No se pudo completar la operación.') })
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <div className="resource-manager">
      {!showForm && (
        <button type="button" className="resource-manager__add" onClick={() => { setShowForm(true); setNotice(null) }}>
          Agregar recurso
        </button>
      )}

      {showForm && (
        <form className="resource-manager__form" onSubmit={handleCreate}>
          <h3 className="resource-manager__form-title">Nuevo recurso</h3>

          <label className="resource-manager__field">
            <span className="resource-manager__label">Código</span>
            <input className="resource-manager__input" value={form.codigo} onChange={setField('codigo')} placeholder="REC-010" maxLength={50} required />
          </label>
          <label className="resource-manager__field">
            <span className="resource-manager__label">Nombre</span>
            <input className="resource-manager__input" value={form.nombre} onChange={setField('nombre')} maxLength={150} required />
          </label>
          <label className="resource-manager__field">
            <span className="resource-manager__label">Tipo</span>
            <select className="resource-manager__input" value={form.tipo} onChange={setField('tipo')}>
              {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="resource-manager__field">
            <span className="resource-manager__label">Ubicación</span>
            <input className="resource-manager__input" value={form.ubicacion} onChange={setField('ubicacion')} maxLength={150} />
          </label>
          <label className="resource-manager__field">
            <span className="resource-manager__label">Descripción (opcional)</span>
            <textarea className="resource-manager__input" rows={2} value={form.descripcion} onChange={setField('descripcion')} maxLength={1000} />
          </label>

          <div className="resource-manager__actions">
            <button type="submit" className="resource-manager__button resource-manager__button--primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar recurso'}
            </button>
            <button type="button" className="resource-manager__button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} disabled={saving}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {notice && (
        <p className={`resource-manager__notice resource-manager__notice--${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          {notice.text}
        </p>
      )}

      {loading ? (
        <Loader />
      ) : (
        <ul className="resource-manager__list">
          {resources.map((resource) => {
            const available = Boolean(resource.disponible)
            return (
              <li key={resource.id} className="resource-manager__item">
                <div className="resource-manager__info">
                  <span className="resource-manager__name">{resource.nombre}</span>
                  <span className="resource-manager__meta">
                    {resource.codigo} · {resource.tipo} · {resource.ubicacion}
                    {resource.estado && resource.estado !== 'Activo' ? ` · ${resource.estado}` : ''}
                  </span>
                </div>
                <span className={`resource-manager__status resource-manager__status--${available ? 'available' : 'unavailable'}`}>
                  {available ? 'Disponible' : 'No disponible'}
                </span>
                <div className="resource-manager__row-actions">
                  <button
                    type="button"
                    className="resource-manager__button"
                    onClick={() => run(() => endpoints.setResourceAvailability(resource.id, !available))}
                  >
                    {available ? 'Marcar no disponible' : 'Marcar disponible'}
                  </button>
                  {confirmingId === resource.id ? (
                    <>
                      <button type="button" className="resource-manager__button resource-manager__button--danger"
                        onClick={() => run(() => endpoints.deleteResource(resource.id), `Recurso "${resource.nombre}" eliminado.`)}>
                        Confirmar eliminación
                      </button>
                      <button type="button" className="resource-manager__button" onClick={() => setConfirmingId(null)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button type="button" className="resource-manager__button" onClick={() => setConfirmingId(resource.id)}>
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
