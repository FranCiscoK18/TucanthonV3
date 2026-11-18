import { CalendarClock, Database } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { DataSource } from '../../types';
import { formatDate } from '../../utils/dates';
import { DemoBadge } from './Badges';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  demo = true,
}: {
  eyebrow: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  demo?: boolean;
}) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <p className="eyebrow">{eyebrow}</p>
          {demo && <DemoBadge />}
        </div>
        <h1 className="title-display text-[40px] md:text-[56px]">{title}</h1>
        {description && <div className="mt-4 max-w-2xl text-[16px] text-muted md:text-[17px]">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

/** Línea de procedencia: fuente, fecha de corte y aviso DEMO. */
export function SourceNote({ source, cutoffDate, children }: { source?: DataSource; cutoffDate?: string; children?: ReactNode }) {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
      {source && (
        <span className="inline-flex items-center gap-1.5">
          <Database aria-hidden className="h-3.5 w-3.5" />
          Fuente:{' '}
          <Link className="link" to={`/normativa#fuente-${source.id}`}>
            {source.name}
          </Link>
        </span>
      )}
      {cutoffDate && (
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock aria-hidden className="h-3.5 w-3.5" />
          Corte: {formatDate(cutoffDate)}
        </span>
      )}
      <span>Información DEMO para validación.</span>
      {children}
    </p>
  );
}

export function Section({ title, eyebrow, description, children, actions, id }: { title: string; eyebrow?: string; description?: ReactNode; children: ReactNode; actions?: ReactNode; id?: string }) {
  return (
    <section className="mt-12 md:mt-16" aria-labelledby={id ? `${id}-title` : undefined} id={id}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 id={id ? `${id}-title` : undefined} className="title-display text-[30px] md:text-[38px]">
            {title}
          </h2>
          {description && <div className="mt-2 text-[15px] text-muted">{description}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
