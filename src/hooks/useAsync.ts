import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

/**
 * Ejecuta una función asíncrona al montar y cuando cambian `deps`.
 * Ignora respuestas obsoletas (condiciones de carrera) y expone `reload`.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: ReadonlyArray<unknown>): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);
  const callId = useRef(0);

  useEffect(() => {
    const id = ++callId.current;
    setLoading(true);
    setError(null);
    fn()
      .then((result) => {
        if (id === callId.current) setData(result);
      })
      .catch((e: unknown) => {
        if (id === callId.current) setError(e instanceof Error ? e : new Error('Error desconocido'));
      })
      .finally(() => {
        if (id === callId.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, loading, error, reload };
}
