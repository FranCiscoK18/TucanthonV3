import { CalendarClock, Database, MapPinned, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DataSource } from '../../types';
import { cx } from '../../utils/cx';
import { formatDate } from '../../utils/dates';
import { DataKindBadge } from './Badges';
import { MetaItem } from './MetaItem';

/** Ficha compacta de fuente: tipo de dato, nombre, fecha de corte, cobertura y limitación. */
export function SourceMeta({
  source,
  cutoffLabel = 'Fecha de corte',
  extra,
  className,
  compact = false,
}: {
  source: DataSource;
  cutoffLabel?: string;
  extra?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <aside className={cx('rounded-[12px] border border-border-mist bg-cream-paper p-4 text-sm', className)} aria-label="Fuente de los datos">
      <div className="flex flex-wrap items-center gap-2">
        <DataKindBadge kind={source.kind} compact />
        <span className="inline-flex items-center gap-1.5 font-semibold text-charcoal">
          <Database className="size-4 text-muted" aria-hidden="true" />
          {source.name}
        </span>
      </div>
      <dl className={cx('mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5', !compact && 'sm:grid-cols-2')}>
        <MetaItem icon={CalendarClock} term={cutoffLabel} valueClassName="font-medium">
          {formatDate(source.cutoffDate)}
        </MetaItem>
        <MetaItem icon={MapPinned} term="Cobertura" valueClassName="font-medium">
          {source.coverage}
        </MetaItem>
        <MetaItem icon={TriangleAlert} term="Limitación" className={cx(!compact && 'sm:col-span-2')}>
          {source.limitations}
        </MetaItem>
      </dl>
      {extra && <div className="mt-3">{extra}</div>}
    </aside>
  );
}
