import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import './Login.css'

// Credenciales de prueba (ver backend/database/seed.sql).
// El botón de cada perfil solo rellena el formulario; sigue
// pasando por el login real del backend al enviar.
const TEST_ACCOUNTS = [
  { label: '🎓 Estudiante', correo: 'estudiante@uajs.edu.co', password: 'estudiante123' },
  { label: '🧑‍🏫 Docente', correo: 'docente@uajs.edu.co', password: 'docente123' },
  { label: '🗂️ Administrativo', correo: 'administrativo@uajs.edu.co', password: 'administrativo123' },
  { label: '⚙️ Administrador', correo: 'admin@uajs.edu.co', password: 'admin123' }
]

export default function Login() {
  const navigate = useNavigate()
  const { login } = useUser()

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(correo, password)
      navigate('/inicio')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No se pudo iniciar sesión. Verifica que el backend esté corriendo y las credenciales sean correctas.'
      )
    } finally {
      setLoading(false)
    }
  }

  const fillTestAccount = (account) => {
    setCorreo(account.correo)
    setPassword(account.password)
    setError(null)
  }

  return (
    <div className="login-container">
      <section className="login-hero">
        <div className="login-hero__content">
          <span className="login-hero__tag">Plataforma institucional</span>
          <h1 className="login-hero__title">Los servicios de la universidad, en un solo lugar</h1>
          <p className="login-hero__description">
            Registra solicitudes, reserva salas y equipos, consulta eventos y recibe avisos
            sobre tus trámites sin pasar por varias plataformas.
          </p>
        </div>
      </section>

      <main className="login-form-wrapper">
        <div className="login-card">
          <div className="login-card__header">
            <h2>Iniciar sesión</h2>
            <p>Ingresa con tu correo institucional para acceder a UAJS Smart Campus.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-correo">Correo institucional</label>
              <input
                id="login-correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tucorreo@uajs.edu.co"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="login-card__error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="test-accounts">
            <p className="test-accounts__label">Cuentas de prueba (clic para rellenar)</p>
            <div className="test-accounts__buttons">
              {TEST_ACCOUNTS.map((account) => (
                <button
                  key={account.correo}
                  type="button"
                  className="test-account-btn"
                  onClick={() => fillTestAccount(account)}
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
