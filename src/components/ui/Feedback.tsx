import { AlertTriangle, CircleCheck, Info, OctagonAlert, RotateCcw, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type Tone = 'info' | 'caution' | 'danger' | 'success';

const toneStyles: Record<Tone, { bg: string; color: string; icon: LucideIcon }> = {
  info: { bg: 'var(--color-info-bg)', color: 'var(--color-info)', icon: Info },
  caution: { bg: 'var(--color-caution-bg)', color: 'var(--color-caution)', icon: AlertTriangle },
  danger: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', icon: OctagonAlert },
  success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', icon: CircleCheck },
};

export function Notice({
  tone = 'info',
  title,
  children,
  className = '',
  role,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  className?: string;
  role?: 'status' | 'alert';
}) {
  const s = toneStyles[tone];
  const Icon = s.icon;
  return (
    <div className={`flex gap-3 rounded-[14px] p-4 ${className}`} style={{ background: s.bg }} role={role}>
      <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0" style={{ color: s.color }} />
      <div className="min-w-0 text-[14.5px] leading-relaxed text-ink">
        {title && <p className="font-semibold" style={{ color: s.color }}>{title}</p>}
        {children && <div className={title ? 'mt-1' : ''}>{children}</div>}
      </div>
    </div>
  );
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

/** Estado de carga con skeleton. */
export function LoadingState({ label = 'Cargando información DEMO…', rows = 3, variant = 'cards' }: { label?: string; rows?: number; variant?: 'cards' | 'list' | 'map' }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {variant === 'map' ? (
        <SkeletonBlock className="h-[420px] w-full" />
      ) : variant === 'list' ? (
        <div className="space-y-3">
          {Array.from({ length: rows }, (_, i) => (
            <SkeletonBlock key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: rows }, (_, i) => (
            <SkeletonBlock key={i} className="h-40 w-full" />
          ))}
        </div>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action, icon: Icon }: { title: string; description: string; action?: ReactNode; icon?: LucideIcon }) {
  return (
    <div className="rounded-[14px] border border-dashed border-[#c9c7bf] bg-paper px-6 py-10 text-center">
      {Icon && <Icon aria-hidden className="mx-auto mb-3 h-8 w-8 text-forest" />}
      <p className="title-display text-2xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">{description}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-[14px] bg-danger-bg px-6 py-8 text-center">
      <OctagonAlert aria-hidden className="mx-auto mb-3 h-8 w-8 text-danger" />
      <p className="font-semibold text-danger">No se pudo cargar la información</p>
      <p className="mx-auto mt-1 max-w-md text-[15px] text-ink">{error.message}</p>
      <button type="button" className="btn btn-primary mt-5" onClick={onRetry}>
        <RotateCcw aria-hidden className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  );
}
