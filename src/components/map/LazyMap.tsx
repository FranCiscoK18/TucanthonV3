/**
 * Carga diferida del mapa (MapLibre pesa ~1 MB) con barrera de errores:
 * si el fragmento no descarga o el navegador no soporta WebGL, se muestra un
 * aviso y la información sigue disponible en la tabla de la vista.
 */
import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react';
import { Skeleton } from '../ui/States';
import type { OndaraMapProps } from './OndaraMap';

const OndaraMap = lazy(() => import('./OndaraMap'));

class MapErrorBoundary extends Component<{ children: ReactNode; className?: string }, { error: Error | null }> {
  override state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('El mapa no pudo mostrarse:', error.message, info.componentStack);
  }

  override render() {
    if (this.state.error) {
      return (
        <div className={`flex flex-col items-center justify-center gap-2 rounded-card bg-border-mist p-6 text-center ${this.props.className ?? ''}`} role="alert">
          <p className="font-semibold text-charcoal">No pudimos mostrar el mapa en este navegador.</p>
          <p className="text-sm text-muted">Los mismos datos están disponibles en la tabla de esta página.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function LazyMap(props: OndaraMapProps) {
  return (
    <MapErrorBoundary className={props.className}>
      <Suspense
        fallback={
          <div className={props.className} role="status" aria-live="polite">
            <span className="sr-only">Cargando el mapa…</span>
            <Skeleton className="h-full w-full rounded-card" />
          </div>
        }
      >
        <OndaraMap {...props} />
      </Suspense>
    </MapErrorBoundary>
  );
}
