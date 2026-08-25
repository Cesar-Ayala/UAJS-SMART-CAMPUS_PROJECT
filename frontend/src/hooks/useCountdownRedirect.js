import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * useCountdownRedirect — custom hook usado en la vista de acceso (Landing).
 * Cuenta regresivamente desde `seconds` y navega automáticamente a `to`
 * si el usuario no interactúa antes de que termine el conteo.
 */
export default function useCountdownRedirect(seconds, to) {
  const [remaining, setRemaining] = useState(seconds)
  const navigate = useNavigate()

  useEffect(() => {
    if (remaining <= 0) {
      navigate(to)
      return
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining, navigate, to])

  const cancel = () => setRemaining(seconds + 9999) // detiene el conteo si el usuario actúa

  return { remaining, cancel }
}
