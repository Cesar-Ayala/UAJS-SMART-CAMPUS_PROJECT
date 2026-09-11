import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import './Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useUser()

  if (!user) return null

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div>
      <h1 className="page__title">Mi perfil</h1>
      <div className="profile-card">
        <div className="profile-card__avatar">{user.nombre.charAt(0)}</div>
        <dl className="profile-card__details">
          <dt>Nombre</dt>
          <dd>{user.nombre}</dd>
          <dt>Tipo de usuario</dt>
          <dd style={{ textTransform: 'capitalize' }}>{user.rol}</dd>
          <dt>Programa / Dependencia</dt>
          <dd>{user.programa || '—'}</dd>
          <dt>Correo</dt>
          <dd>{user.correo}</dd>
        </dl>
      </div>

      <button
        type="button"
        className="login__test-btn"
        style={{ marginTop: 20 }}
        onClick={handleLogout}
      >
        Cerrar sesión
      </button>
    </div>
  )
}
