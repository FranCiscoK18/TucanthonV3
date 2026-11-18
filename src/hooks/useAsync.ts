/**
 * Carga asíncrona con estados de carga, error y éxito. Ignora respuestas
 * obsoletas (si cambian los filtros antes de que termine la petición anterior)
 * y conserva los datos previos mientras recarga, para evitar parpadeos.
 */
import { useCallback, useEffect, useEffectEvent, useState, type DependencyList } from 'react';

export type AsyncResource<T> =
  | { status: 'loading'; previous?: T }
  | { status: 'error'; error: Error; previous?: T }
  | { status: 'success'; data: T };

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error('Ocurrió un error inesperado.');
}

function lastData<T>(resource: AsyncResource<T>): T | undefined {
  return resource.status === 'success' ? resource.data : resource.previous;
}

export function useAsync<T>(factory: () => Promise<T>, deps: DependencyList) {
  const [resource, setResource] = useState<AsyncResource<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const run = useEffectEvent(factory);

  useEffect(() => {
    let active = true;
    setResource((current) => ({ status: 'loading', previous: lastData(current) }));
    run().then(
      (data) => {
        if (active) setResource({ status: 'success', data });
      },
      (error: unknown) => {
        if (active) setResource((current) => ({ status: 'error', error: toError(error), previous: lastData(current) }));
      },
    );
    return () => {
      active = false;
    };
    // Las dependencias las declara quien usa el hook.
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  const mutate = useCallback((data: T) => setResource({ status: 'success', data }), []);

  return { resource, data: lastData(resource), reload, mutate };
}
