import { useSyncExternalStore } from 'react';

/** `true` mientras la consulta de medios se cumpla (p. ej. «(min-width: 1280px)»). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (listener) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
