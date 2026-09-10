import { useState, useEffect, useCallback } from 'react'

export interface AsyncState<T> {
  data:    T
  loading: boolean
  error:   string | null
  refetch: () => void
}

export function useAsync<T>(
  fetcher:      () => Promise<T>,
  defaultValue: T,
  deps:         any[] = [],
): AsyncState<T> {
  const [data,    setData]    = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [tick,    setTick]    = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher()
      .then((r)  => { if (!cancelled) { setData(r);  setLoading(false) } })
      .catch((e) => { if (!cancelled) { setError(e?.message ?? 'Error'); setLoading(false) } })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])

  return { data, loading, error, refetch }
}
