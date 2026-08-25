import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import { mockProfile } from '../data/mockData.js'
import './Profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const { profile, role, logout } = useUser()

  const data = profile || mockProfile

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div>
      <h1 className="page__title">Mi perfil</h1>
      <div className="profile-card">
        <div className="profile-card__avatar">{data.nombre.charAt(0)}</div>
        <dl className="profile-card__details">
          <dt>Nombre</dt>
          <dd>{data.nombre}</dd>
          <dt>Tipo de usuario</dt>
          <dd>{data.tipoUsuario}</dd>
          <dt>Programa / Dependencia</dt>
          <dd>{data.programa}</dd>
          <dt>Correo</dt>
          <dd>{data.correo}</dd>
        </dl>
      </div>

      {role && (
        <button
          type="button"
          className="landing__profile-btn"
          style={{ marginTop: 20 }}
          onClick={handleLogout}
        >
          Cambiar de perfil
        </button>
      )}
    </div>
  )
}
