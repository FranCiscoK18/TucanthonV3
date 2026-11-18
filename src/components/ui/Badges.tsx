import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DataKind } from '../../types';
import { cx } from '../../utils/cx';

/**
 * Etiqueta obligatoria en todo dato simulado. Va sin icono y con borde sólido para
 * no confundirse con la insignia de tipo «Simulado» (matraz y borde punteado).
 */
export function DemoTag(_props: { className?: string; label?: string }) {
  // Las vistas con cifras incluyen una aclaración de procedencia sin mostrar etiquetas de desarrollo.
  return null;
}

/** Etiquetas de clasificación retiradas de la presentación. */
export function DataKindBadge(_props: { kind: DataKind; compact?: boolean; className?: string }) {
  return null;
}

export type Tone = 'neutral' | 'forest' | 'blue' | 'terracotta' | 'plum' | 'aqua' | 'amber' | 'closed' | 'danger' | 'warning';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-simulado-50 text-simulado-700',
  forest: 'bg-oficial-50 text-oficial-700',
  blue: 'bg-estimado-50 text-estimado-700',
  terracotta: 'bg-ciudadano-50 text-ciudadano-700',
  plum: 'bg-revisado-50 text-revisado-700',
  aqua: 'bg-brigada-50 text-brigada-700',
  amber: 'bg-vector-50 text-vector-700',
  closed: 'bg-cerrado-50 text-cerrado-700',
  danger: 'bg-danger-50 text-danger-700',
  warning: 'bg-warning-50 text-warning-700',
};

export function Pill({
  tone = 'neutral',
  icon: Icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx('pill', toneClass[tone], className)}>
      {Icon && <Icon className="size-3.5 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}
