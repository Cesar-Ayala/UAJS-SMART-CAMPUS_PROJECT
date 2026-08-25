import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext(null)

const STORAGE_KEY = 'uajs_smart_campus_user'

const ROLE_PROFILES = {
  estudiante: { nombre: 'Ana María Torres', tipoUsuario: 'Estudiante', programa: 'Ingeniería de Sistemas', correo: 'ana.torres@uajs.edu.co' },
  docente: { nombre: 'Carlos Pérez Ruiz', tipoUsuario: 'Docente', programa: 'Facultad de Ingeniería', correo: 'carlos.perez@uajs.edu.co' },
  administrativo: { nombre: 'Laura Gómez Díaz', tipoUsuario: 'Administrativo', programa: 'Bienestar Universitario', correo: 'laura.gomez@uajs.edu.co' },
  admin: { nombre: 'Sistema UAJS', tipoUsuario: 'Administrador', programa: 'Tecnología e Informática', correo: 'admin@uajs.edu.co' }
}

export function UserProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_KEY) || null)

  useEffect(() => {
    if (role) localStorage.setItem(STORAGE_KEY, role)
  }, [role])

  const profile = role ? ROLE_PROFILES[role] : null

  const value = {
    role,
    profile,
    selectRole: (newRole) => setRole(newRole),
    logout: () => {
      localStorage.removeItem(STORAGE_KEY)
      setRole(null)
    }
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

/**
 * useUser — custom hook para acceder al rol/perfil seleccionado
 * desde cualquier componente de la aplicación.
 */
export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser debe usarse dentro de <UserProvider>')
  return context
}

export const ROLE_LABELS = {
  estudiante: '🎓 Estudiante',
  docente: '🧑‍🏫 Docente',
  administrativo: '🗂️ Administrativo',
  admin: '⚙️ Administrador'
}
