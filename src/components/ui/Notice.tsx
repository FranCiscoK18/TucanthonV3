import { Info, Lightbulb, Scale, ShieldCheck, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

type NoticeTone = 'info' | 'integrity' | 'privacy' | 'caution' | 'tip';

const toneStyles: Record<NoticeTone, { className: string; icon: LucideIcon }> = {
  info: { className: 'bg-estimado-50 text-estimado-700', icon: Info },
  integrity: { className: 'bg-keylime-wash text-forest-ink', icon: Scale },
  privacy: { className: 'bg-revisado-50 text-revisado-700', icon: ShieldCheck },
  caution: { className: 'bg-warning-50 text-warning-700', icon: TriangleAlert },
  tip: { className: 'bg-mint-veil text-forest-ink', icon: Lightbulb },
};

/** Aviso en tono sereno. `role` solo se usa cuando el aviso aparece como respuesta a una acción. */
export function Notice({
  tone = 'info',
  title,
  children,
  className,
  icon,
  role,
}: {
  tone?: NoticeTone;
  title?: string;
  children: ReactNode;
  className?: string;
  icon?: LucideIcon;
  role?: 'status' | 'alert';
}) {
  const style = toneStyles[tone];
  const Icon = icon ?? style.icon;
  return (
    <div className={cx('flex gap-3 rounded-[12px] px-4 py-3.5 text-[0.9375rem] leading-relaxed', style.className, className)} role={role}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cx(title && 'mt-0.5')}>{children}</div>
      </div>
    </div>
  );
}
