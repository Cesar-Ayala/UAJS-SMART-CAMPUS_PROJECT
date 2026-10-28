import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * useCountdownRedirect — custom hook usado en la vista de acceso (Landing).
 * Cuenta regresivamente desde `seconds` y navega automáticamente a `to`
 * si el usuario no interactúa antes de que termine el conteo.
 *
 * Devuelve:
 *  - remaining: segundos que faltan para la redirección.
 *  - active: false cuando el usuario canceló la redirección.
 *  - cancel: detiene el conteo (la redirección ya no ocurre).
 */
export default function useCountdownRedirect(seconds, to) {
  const [remaining, setRemaining] = useState(seconds)
  const [active, setActive] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!active) return

    if (remaining <= 0) {
      navigate(to, { replace: true })
      return
    }

    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining, active, navigate, to])

  const cancel = useCallback(() => setActive(false), [])

  return { remaining, active, cancel }
}
