import { ArrowLeft, CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DataKindBadge } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { PageHeader, SourceNote } from '../components/ui/Layout';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { activityStatusLabels, activityStatusTone as statusTone, scheduleLabels, targetPopulationLabels } from '../mocks/brigades';
import { diseaseById } from '../mocks/diseases';
import { regionName } from '../mocks/regions';
import { sourceById } from '../mocks/sources';
import { getBrigade } from '../services/brigadeService';
import { DEMO_CUTOFF_DATE, formatLongDate } from '../utils/dates';

export default function BrigadeDetail() {
  const { id = '' } = useParams();
  const { data, loading, error, reload } = useAsync(() => getBrigade(id), [id]);
  useDocumentTitle(data?.title ?? 'Brigada');

  if (loading) return <LoadingState rows={2} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data)
    return (
      <EmptyState
        title="Brigada no encontrada"
        description="No existe una actividad DEMO con ese identificador."
        action={
          <Link className="btn btn-primary" to="/brigadas">
            Ver brigadas
          </Link>
        }
      />
    );

  return (
    <>
      <Link to="/brigadas" className="link mb-6 inline-flex items-center gap-1.5 text-[14px]">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Brigadas y campañas
      </Link>
      <PageHeader eyebrow="Brigada DEMO" title={data.title} />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="card">
          <div className="flex flex-wrap gap-2">
            <DataKindBadge kind="brigada" />
            <span className={`pill ${statusTone[data.status]}`}>Estado DEMO: {activityStatusLabels[data.status]}</span>
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Item icon={<CalendarDays className="h-5 w-5" />} term="Fecha" value={formatLongDate(data.date)} />
            <Item icon={<Clock className="h-5 w-5" />} term="Horario" value={`${data.startTime}–${data.endTime} (${scheduleLabels[data.schedule].toLowerCase()})`} />
            <Item icon={<MapPin className="h-5 w-5" />} term="Ubicación aproximada" value={`Zona ${regionName(data.regionId)} · ${data.approximatePlace}`} />
            <Item icon={<Users className="h-5 w-5" />} term="Población objetivo" value={data.targetPopulation.map((p) => targetPopulationLabels[p]).join(', ')} />
          </dl>
          <h2 className="mt-6 text-[17px] font-semibold text-forest">Requisitos</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
            {data.requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <h2 className="mt-6 text-[17px] font-semibold text-forest">Enfermedades relacionadas</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {data.diseaseIds.map((d) => (
              <li key={d}>
                <Link to={`/enfermedades/${d}`} className="pill bg-keylime text-forest hover:bg-mint">
                  {diseaseById(d)?.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Notice tone="caution" title="No acudir: actividad simulada">
          Esta brigada es un escenario DEMO. La ubicación se muestra por zona y sin dirección exacta. Consulta los canales oficiales de la
          autoridad sanitaria para actividades reales.
        </Notice>
      </div>
      <SourceNote source={sourceById(data.sourceId)} cutoffDate={DEMO_CUTOFF_DATE} />
    </>
  );
}

function Item({ icon, term, value }: { icon: ReactNode; term: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span aria-hidden className="text-muted">
        {icon}
      </span>
      <div>
        <dt className="text-[13px] font-semibold">{term}</dt>
        <dd className="text-[15px]">{value}</dd>
      </div>
    </div>
  );
}
