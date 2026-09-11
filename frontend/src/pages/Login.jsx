import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'
import './Login.css'

// Credenciales de prueba (ver backend/database/schema.sql).
// El botón de cada perfil solo rellena el formulario; sigue
// pasando por el login real del backend al enviar.
const TEST_ACCOUNTS = [
  { label: '🎓 Estudiante', correo: 'estudiante@uajs.edu.co', password: 'estudiante123' },
  { label: '🧑‍🏫 Docente', correo: 'docente@uajs.edu.co', password: 'docente123' },
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
    <div className="login">
      <div className="login__card">
        <h1 className="login__title">UAJS Smart Campus</h1>
        <p className="login__subtitle">
          Inicia sesión para acceder a la plataforma de servicios universitarios.
        </p>

        <form className="login__form" onSubmit={handleSubmit}>
          <label className="login__field">
            <span className="login__label">Correo institucional</span>
            <input
              className="login__input"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tucorreo@uajs.edu.co"
              required
            />
          </label>

          <label className="login__field">
            <span className="login__label">Contraseña</span>
            <input
              className="login__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="login__error">{error}</p>}

          <button type="submit" className="login__submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="login__test-accounts">
          <p className="login__test-label">Cuentas de prueba (clic para rellenar):</p>
          <div className="login__test-buttons">
            {TEST_ACCOUNTS.map((account) => (
              <button
                key={account.correo}
                type="button"
                className="login__test-btn"
                onClick={() => fillTestAccount(account)}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
