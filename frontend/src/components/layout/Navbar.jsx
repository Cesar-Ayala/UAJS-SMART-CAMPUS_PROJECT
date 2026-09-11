import { NavLink, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext.jsx'
import './Navbar.css'

const LINKS = [
  { to: '/inicio', label: 'Inicio' },
  { to: '/notificaciones', label: 'Notificaciones' }
]

export default function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useUser()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <NavLink to="/inicio" className="navbar__brand">
        UAJS <span className="navbar__brand-accent">Smart Campus</span>
      </NavLink>
      <nav className="navbar__links">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
            }
          >
            {link.label}
          </NavLink>
        ))}
        <span className="navbar__user">{user?.nombre}</span>
        <button type="button" className="navbar__logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </nav>
    </header>
  )
}
