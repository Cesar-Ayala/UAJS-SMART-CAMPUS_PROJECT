import { NavLink } from 'react-router-dom'
import './Navbar.css'

const LINKS = [
  { to: '/inicio', label: 'Inicio' },
  { to: '/solicitudes', label: 'Solicitudes' },
  { to: '/reservas', label: 'Reservas' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/notificaciones', label: 'Notificaciones' },
  { to: '/perfil', label: 'Perfil' }
]

export default function Navbar() {
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
      </nav>
    </header>
  )
}
