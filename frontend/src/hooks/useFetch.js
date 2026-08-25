import { useEffect, useState, useCallback } from 'react'

/**
 * useFetch — custom hook para consumir la API con estados de carga y error.
 * Si la petición falla (por ejemplo, backend aún no desplegado), cae de vuelta
 * a un valor "fallback" (útil durante el desarrollo del frontend con mocks).
 *
 * @param {Function} requestFn - función que retorna una promesa (axios call)
 * @param {any} fallback - datos de respaldo si la petición falla
 * @param {Array} deps - dependencias para re-ejecutar la petición
 */
export default function useFetch(requestFn, fallback = null, deps = []) {
  const [data, setData] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await requestFn()
      setData(response.data)
    } catch (err) {
      setError(err)
      setData(fallback)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load }
}
