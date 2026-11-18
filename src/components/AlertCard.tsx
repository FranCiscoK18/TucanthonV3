import { CalendarDays, Database, Filter, Info, TrendingUp, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router';
import type { Alert } from '../types';
import { formatDate } from '../utils/dates';
import { DemoTag } from './ui/Badges';
import { MetaItem } from './ui/MetaItem';

/**
 * Aviso informativo: fuente, fecha, criterio y limitación siempre disponibles.
 * En modo compacto (listados) esos datos quedan plegados bajo «Fuente y criterio».
 */
export function AlertCard({ alert, compact = false }: { alert: Alert; compact?: boolean }) {
  const Icon = alert.level === 'seguimiento' ? TrendingUp : Info;
  const meta = (
    <dl className="mt-3 space-y-2.5 text-sm">
      <MetaItem icon={Database} term="Fuente">
        {alert.source}
      </MetaItem>
      <MetaItem icon={CalendarDays} term="Fecha">
        {formatDate(alert.date)}
      </MetaItem>
      <MetaItem icon={Filter} term="Criterio">
        {alert.criteria}
      </MetaItem>
      <MetaItem icon={TriangleAlert} term="Limitación">
        {alert.limitations}
      </MetaItem>
    </dl>
  );
  return (
    <article className="card card-cream flex h-full flex-col" aria-labelledby={`aviso-${alert.id}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill bg-keylime-wash text-forest-ink">
          <Icon className="size-3.5" aria-hidden="true" />
          {alert.level === 'seguimiento' ? 'Aviso de seguimiento' : 'Aviso informativo'}
        </span>
        <DemoTag />
      </div>
      <h3 id={`aviso-${alert.id}`} className="mt-3 text-[1.25rem]">
        {alert.title}
      </h3>
      <p className="mt-2 leading-relaxed">{alert.message}</p>
      {compact ? (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-medium text-forest-ink">
            Fuente y criterio · {formatDate(alert.date)}
          </summary>
          {meta}
        </details>
      ) : (
        <div className="mt-1">{meta}</div>
      )}
      {alert.relatedDiseaseId && (
        <Link className="link mt-4 self-start text-sm" to={`/enfermedades/${alert.relatedDiseaseId}`}>
          Ver la serie y los criterios
        </Link>
      )}
    </article>
  );
}
