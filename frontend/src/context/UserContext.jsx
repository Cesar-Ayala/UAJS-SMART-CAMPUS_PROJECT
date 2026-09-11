import { createContext, useContext, useState } from 'react'
import { endpoints } from '../api/client.js'

const UserContext = createContext(null)

const TOKEN_KEY = 'uajs_smart_campus_token'
const USER_KEY = 'uajs_smart_campus_user'

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)

  /**
   * login — llama al endpoint /api/auth/login del backend.
   * Si las credenciales son correctas, guarda el token JWT y los
   * datos del usuario (nombre, correo, rol, programa) en localStorage
   * para que la sesión persista aunque se recargue la página.
   */
  const login = async (correo, password) => {
    const { data } = await endpoints.login({ correo, password })
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    return data.user
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

/**
 * useUser — custom hook para acceder a la sesión actual (usuario, token,
 * login, logout) desde cualquier componente de la aplicación.
 */
export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser debe usarse dentro de <UserProvider>')
  return context
}
