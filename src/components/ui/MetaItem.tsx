import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

/**
 * Par término/valor dentro de un `<dl>`. El icono va dentro del `<dt>` para que la
 * lista de definiciones sea válida (cada grupo contiene solo `dt` y `dd`).
 */
export function MetaItem({
  icon: Icon,
  term,
  children,
  className,
  valueClassName,
}: {
  icon: LucideIcon;
  term: ReactNode;
  children: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={className}>
      <dt className="flex items-center gap-2 text-muted">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {term}
      </dt>
      <dd className={cx('mt-0.5 pl-6', valueClassName)}>{children}</dd>
    </div>
  );
}
