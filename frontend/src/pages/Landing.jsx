import { useNavigate } from 'react-router-dom'
import { useUser, ROLE_LABELS } from '../context/UserContext.jsx'
import './Landing.css'

export default function Landing() {
  const navigate = useNavigate()
  const { selectRole } = useUser()

  const handleSelectRole = (role) => {
    selectRole(role)
    navigate('/inicio')
  }

  return (
    <div className="landing">
      <div className="landing__card">
        <h1 className="landing__title">UAJS Smart Campus</h1>
        <p className="landing__subtitle">
          Plataforma distribuida para la gestión y articulación de servicios universitarios
          de la Corporación Universitaria Antonio José de Sucre.
        </p>

        <p className="landing__prompt">Ingresa según tu perfil:</p>

        <div className="landing__profiles">
          {Object.entries(ROLE_LABELS).map(([role, label]) => (
            <button
              key={role}
              type="button"
              className="landing__profile-btn"
              onClick={() => handleSelectRole(role)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
