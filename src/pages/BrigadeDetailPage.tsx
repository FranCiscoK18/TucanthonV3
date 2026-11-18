import { ArrowLeft, CalendarDays, Clock, ClipboardList, Landmark, MapPin, Users } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { ActivityStatusPill, ActivityTypePill } from '../components/ActivityCard';
import { activitiesDataset, ONLY_BRIGADES } from '../components/map/activitiesDataset';
import { LazyMap } from '../components/map/LazyMap';
import { DataKindBadge, DemoTag } from '../components/ui/Badges';
import { MetaItem } from '../components/ui/MetaItem';
import { Notice } from '../components/ui/Notice';
import { SourceMeta } from '../components/ui/SourceMeta';
import { AsyncContent, LoadingState } from '../components/ui/States';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { targetPopulationLabels } from '../mocks/activities';
import { diseaseById } from '../mocks/diseases';
import { regionById } from '../mocks/regions';
import { getActivity } from '../services/activityService';
import { getDataSourcesSnapshot } from '../services/sourceService';
import { formatDateLong } from '../utils/dates';

export function BrigadeDetailPage() {
  const { activityId = '' } = useParams();
  const { resource, data, reload } = useAsync(() => getActivity(activityId), [activityId]);
  useDocumentTitle(data?.title ?? 'Brigada o campaña');
  const dataset = useMemo(() => activitiesDataset(data ? [data] : []), [data]);
  const source = getDataSourcesSnapshot().find((item) => item.id === 'fuente-agenda-brigadas');
  const noop = useCallback(() => undefined, []);

  return (
    <>
      <Link to="/brigadas" className="link mb-4 inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft className="size-4" aria-hidden="true" /> Volver a brigadas y campañas
      </Link>
      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={4} />} errorTitle="No pudimos cargar esta actividad">
        {(activity) => {
          const region = regionById.get(activity.regionId);
          return (
            <article aria-labelledby="actividad-titulo">
              <div className="flex flex-wrap items-center gap-2">
                <ActivityTypePill activity={activity} />
                <ActivityStatusPill status={activity.status} />
                <DataKindBadge kind="simulado" compact />
                <DemoTag />
              </div>
              <h1 id="actividad-titulo" className="mt-4 text-[2.25rem] sm:text-[2.75rem]">
                {activity.title}
              </h1>
              <p className="mt-3 max-w-3xl text-[1.0625rem] leading-relaxed text-muted">{activity.description}</p>

              <Notice tone="caution" title="Evento ficticio" className="mt-6">
                No acudas a esta sede: la actividad forma parte del escenario DEMO.
              </Notice>

              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                <div className="space-y-4">
                  <dl className="card card-keylime grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <MetaItem icon={CalendarDays} term="Fecha" valueClassName="font-medium first-letter:uppercase">
                      {formatDateLong(activity.date)}
                    </MetaItem>
                    <MetaItem icon={Clock} term="Horario" valueClassName="font-medium">
                      {activity.startTime}–{activity.endTime} h
                    </MetaItem>
                    <MetaItem icon={MapPin} term="Ubicación aproximada" className="sm:col-span-2">
                      <span className="font-medium">
                        {region?.name} · {activity.venueHint}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted">
                        Se indica solo la zona y un tipo de espacio público; no se publica una dirección exacta.
                      </span>
                    </MetaItem>
                    <MetaItem icon={Users} term="Población objetivo" valueClassName="font-medium">
                      {activity.targetPopulations.map((target) => targetPopulationLabels[target]).join(', ')}
                    </MetaItem>
                    <MetaItem icon={Landmark} term="Organiza" valueClassName="font-medium">
                      {activity.organizer}
                    </MetaItem>
                  </dl>

                  <div className="card card-cream">
                    <h2 className="flex items-center gap-2 text-[1.375rem]">
                      <ClipboardList className="size-5" aria-hidden="true" /> Requisitos
                    </h2>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5">
                      {activity.requirements.map((requirement) => (
                        <li key={requirement}>{requirement}</li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm text-muted">
                      {activity.type === 'brigada-vacunacion' ? 'Vacunas' : 'Tema'}:{' '}
                      {activity.type === 'brigada-vacunacion' ? activity.vaccines.join(', ') : activity.topic}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      Relacionada con:{' '}
                      {activity.diseaseIds.map((id, index) => (
                        <span key={id}>
                          {index > 0 && ', '}
                          <Link className="link font-normal" to={`/enfermedades/${id}`}>
                            {diseaseById.get(id)?.name ?? id}
                          </Link>
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <LazyMap
                    className="h-80"
                    dataset={dataset}
                    visible={ONLY_BRIGADES}
                    selectedRegionId={activity.regionId}
                    selectedActivityId={activity.id}
                    onSelectRegion={noop}
                    onSelectActivity={noop}
                  />
                  {source && <SourceMeta source={source} compact />}
                </div>
              </div>
            </article>
          );
        }}
      </AsyncContent>
    </>
  );
}
