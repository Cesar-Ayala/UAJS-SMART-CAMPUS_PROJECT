import { Link } from 'react-router-dom'
import { mockServices } from '../data/mockData.js'
import './Landing.css'

const USER_PROFILES = [
  'Estudiante',
  'Docente',
  'Personal administrativo',
  'Administrador del sistema'
]

/**
 * Landing — vista de acceso de UAJS Smart Campus.
 * Presenta la plataforma, sus servicios y los perfiles de usuario.
 * El botón principal lleva al inicio de sesión (/login).
 */
export default function Landing() {
  return (
    <div className="landing">
      <header className="landing__header">
        <span className="landing__brand">UAJS Smart Campus</span>
        <span className="landing__institution">
          Corporación Universitaria Antonio José de Sucre
        </span>
      </header>

      <main className="landing__main">
        <section className="landing__intro">
          <h1 className="landing__title">Los servicios de la universidad, en un solo lugar</h1>
          <p className="landing__lead">
            Registra solicitudes, reserva salas y equipos, consulta eventos y recibe avisos
            sobre tus trámites sin pasar por varias plataformas.
          </p>

          <Link className="landing__cta" to="/login">
            Iniciar sesión
          </Link>
        </section>

        <div className="landing__side">
          <section aria-labelledby="landing-services">
            <h2 id="landing-services" className="landing__section-title">
              Qué puedes hacer
            </h2>
            <ul className="landing__services">
              {mockServices.map((service) => (
                <li key={service.id} className="landing__service">
                  <span className="landing__service-name">{service.nombre}</span>
                  <span className="landing__service-desc">{service.descripcion}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="landing-profiles">
            <h2 id="landing-profiles" className="landing__section-title">
              Para quién es
            </h2>
            <ul className="landing__profiles">
              {USER_PROFILES.map((profile) => (
                <li key={profile} className="landing__profile">
                  {profile}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
