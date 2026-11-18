import { CalendarDays, Clock, MapPin, Megaphone, Syringe, Users } from 'lucide-react';
import { Link } from 'react-router';
import { activityStatusLabels, targetPopulationLabels } from '../mocks/activities';
import { diseaseName } from '../mocks/diseases';
import { regionName } from '../mocks/regions';
import type { ActivityStatus, HealthActivity } from '../types';
import { cx } from '../utils/cx';
import { formatDateLong } from '../utils/dates';
import { Pill, type Tone } from './ui/Badges';

const statusTone: Record<ActivityStatus, Tone> = {
  programada: 'forest',
  'en-curso': 'aqua',
  finalizada: 'neutral',
  reprogramada: 'warning',
};

export function ActivityStatusPill({ status }: { status: ActivityStatus }) {
  return <Pill tone={statusTone[status]}>{activityStatusLabels[status]}</Pill>;
}

export function ActivityTypePill({ activity }: { activity: HealthActivity }) {
  return activity.type === 'brigada-vacunacion' ? (
    <Pill tone="aqua" icon={Syringe}>
      Brigada de vacunación
    </Pill>
  ) : (
    <Pill tone="aqua" icon={Megaphone}>
      Campaña preventiva
    </Pill>
  );
}

export function ActivityCard({
  activity,
  selected = false,
  onShowOnMap,
}: {
  activity: HealthActivity;
  selected?: boolean;
  onShowOnMap?: () => void;
}) {
  return (
    <article
      className={cx('card flex h-full flex-col', selected ? 'bg-brigada-50' : 'card-cream')}
      aria-labelledby={`actividad-${activity.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ActivityTypePill activity={activity} />
        <ActivityStatusPill status={activity.status} />
      </div>
      <h3 id={`actividad-${activity.id}`} className="mt-3 text-[1.375rem]">
        {activity.title}
      </h3>
      <ul className="mt-3 space-y-1.5 text-[0.9375rem]">
        <li className="flex gap-2">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          <span className="first-letter:uppercase">{formatDateLong(activity.date)}</span>
        </li>
        <li className="flex gap-2">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          {activity.startTime}–{activity.endTime} h
        </li>
        <li className="flex gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          <span>
            {regionName(activity.regionId)} <span className="text-muted">· ubicación aproximada</span>
          </span>
        </li>
        <li className="flex gap-2">
          <Users className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          {activity.targetPopulations.map((target) => targetPopulationLabels[target]).join(', ')}
        </li>
      </ul>
      <p className="mt-3 text-sm text-muted">Relacionada con: {activity.diseaseIds.map(diseaseName).join(', ')}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
        <Link className="btn btn-secondary btn-sm" to={`/brigadas/${activity.id}`}>
          Ver detalle<span className="sr-only"> de {activity.title}</span>
        </Link>
        {onShowOnMap && (
          <button type="button" className="link text-sm" onClick={onShowOnMap}>
            Ubicar en el mapa
          </button>
        )}
      </div>
    </article>
  );
}
