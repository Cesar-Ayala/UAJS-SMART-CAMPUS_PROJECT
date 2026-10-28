import { NavLink, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext.jsx'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useUser()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Inicial del usuario para el avatar
  const inicial = user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <NavLink to="/inicio" className="navbar__brand">
          <div className="navbar__logo-icon">UAJS</div>
          <div className="navbar__brand-text">
            <span className="navbar__brand-title">Smart Campus</span>
            <span className="navbar__brand-subtitle">Corporación Universitaria</span>
          </div>
        </NavLink>

        {/* Links de Navegación Principal */}
        <nav className="navbar__nav">
          <NavLink
            to="/inicio"
            className={({ isActive }) =>
              'navbar__link' + (isActive ? ' navbar__link--active' : '')
            }
          >
            Inicio
          </NavLink>
          <NavLink
            to="/solicitudes"
            className={({ isActive }) =>
              'navbar__link' + (isActive ? ' navbar__link--active' : '')
            }
          >
            Solicitudes
          </NavLink>
          <NavLink
            to="/reservas"
            className={({ isActive }) =>
              'navbar__link' + (isActive ? ' navbar__link--active' : '')
            }
          >
            Reservas
          </NavLink>
          <NavLink
            to="/eventos"
            className={({ isActive }) =>
              'navbar__link' + (isActive ? ' navbar__link--active' : '')
            }
          >
            Eventos
          </NavLink>
          <NavLink
            to="/notificaciones"
            className={({ isActive }) =>
              'navbar__link' + (isActive ? ' navbar__link--active' : '')
            }
          >
            Notificaciones
          </NavLink>
        </nav>

        {/* Perfil del Usuario / Botón Salir */}
        <div className="navbar__user-section">
          {user ? (
            <div className="navbar__profile">
              <div className="navbar__avatar">{inicial}</div>
              <div className="navbar__user-info">
                <span className="navbar__user-name">{user.nombre}</span>
                <span className="navbar__user-role">{user.rol || 'Estudiante'}</span>
              </div>
              <button
                type="button"
                className="navbar__logout-btn"
                onClick={handleLogout}
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="navbar__login-link">
              Iniciar Sesión
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}