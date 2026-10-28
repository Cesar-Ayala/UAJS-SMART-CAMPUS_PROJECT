import './ResourceCard.css'

/**
 * ResourceCard — recurso reservable (sala, laboratorio, equipo).
 * Es un botón real: se puede elegir con teclado y los recursos
 * no disponibles quedan deshabilitados.
 */
export default function ResourceCard({ resource, selected, onSelect }) {
  const available = Boolean(resource.disponible)
  const className = `resource-card${selected ? ' resource-card--selected' : ''}`

  return (
    <button
      type="button"
      className={className}
      disabled={!available}
      aria-pressed={selected}
      onClick={() => onSelect(resource)}
    >
      <span className="resource-card__name">{resource.nombre}</span>
      <span className="resource-card__meta">
        {resource.tipo} · {resource.ubicacion}
      </span>
      <span
        className={`resource-card__status resource-card__status--${
          available ? 'available' : 'unavailable'
        }`}
      >
        {available ? 'Disponible' : 'No disponible'}
      </span>
    </button>
  )
}
