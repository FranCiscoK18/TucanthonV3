import { CloudOff, Inbox, RotateCcw, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AsyncResource } from '../../hooks/useAsync';
import { cx } from '../../utils/cx';
import { Button } from './Button';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('skeleton', className)} aria-hidden="true" />;
}

/** Estado de carga con esqueletos; anuncia «Cargando…» a lectores de pantalla. */
export function LoadingState({ label = 'Cargando información…', lines = 3, className }: { label?: string; lines?: number; className?: string }) {
  return (
    <div className={cx('space-y-3', className)} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-7 w-2/5" />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cx('h-16', index % 2 === 1 ? 'w-11/12' : 'w-full')} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className,
  headingLevel: Heading = 'h3',
}: {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
  /** Nivel del título según el lugar donde aparece (evita saltos en la jerarquía). */
  headingLevel?: 'h2' | 'h3';
}) {
  return (
    <div className={cx('rounded-card border border-dashed border-line/70 bg-cream-paper px-6 py-10 text-center', className)}>
      <Icon className="mx-auto size-8 text-leaf" aria-hidden="true" />
      <Heading className="mt-3 text-[1.25rem]">{title}</Heading>
      <div className="mx-auto mt-2 max-w-md text-muted">{description}</div>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'No pudimos cargar esta información',
  error,
  onRetry,
  className,
}: {
  title?: string;
  error: Error;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={cx('rounded-card bg-danger-50 px-6 py-8 text-center text-danger-700', className)} role="alert">
      <CloudOff className="mx-auto size-8" aria-hidden="true" />
      <h3 className="mt-3 text-[1.25rem] text-danger-700">{title}</h3>
      <p className="mx-auto mt-2 max-w-md">{error.message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="danger" icon={RotateCcw} onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Renderiza un recurso asíncrono: esqueleto en la primera carga, error con
 * reintento, y los datos previos (atenuados) mientras se recarga.
 */
export function AsyncContent<T>({
  resource,
  onRetry,
  loading,
  errorTitle,
  children,
}: {
  resource: AsyncResource<T>;
  onRetry: () => void;
  loading?: ReactNode;
  errorTitle?: string;
  children: (data: T) => ReactNode;
}) {
  if (resource.status === 'success') return <>{children(resource.data)}</>;
  if (resource.status === 'error') return <ErrorState title={errorTitle} error={resource.error} onRetry={onRetry} />;
  if (resource.previous !== undefined) {
    return (
      <div className="relative" aria-busy="true">
        <span className="sr-only" role="status">
          Actualizando…
        </span>
        <div className="pointer-events-none opacity-55 transition-opacity">{children(resource.previous)}</div>
      </div>
    );
  }
  return <>{loading ?? <LoadingState />}</>;
}
