import { CalendarDays, Clock, List, Map as MapIcon, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { OndaraMap, type MapLayerId } from '../components/map/OndaraMap';
import { DataKindBadge } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { Field } from '../components/ui/Form';
import { PageHeader, Section, SourceNote } from '../components/ui/Layout';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { activityStatusLabels, activityStatusTone as statusTone, scheduleLabels, targetPopulationLabels } from '../mocks/brigades';
import { diseaseById, diseases } from '../mocks/diseases';
import { regionName } from '../mocks/regions';
import { sourceById } from '../mocks/sources';
import { getBrigades, getCampaigns, type BrigadeFilters } from '../services/brigadeService';
import { getMapData } from '../services/epidemiologyService';
import type { ScheduleBlock, TargetPopulation, VaccinationBrigade } from '../types';
import { DEMO_CUTOFF_DATE, formatDate, formatLongDate } from '../utils/dates';

const BRIGADE_ONLY: Record<MapLayerId, boolean> = {
  oficial: false,
  estimado: false,
  ciudadano: false,
  revisado: false,
  brigada: true,
  vector: false,
};

export default function Brigades() {
  useDocumentTitle('Brigadas y campañas');
  const [filters, setFilters] = useState<BrigadeFilters>({ diseaseId: 'todas', from: '', schedule: 'todos', population: 'todas', includeFinished: false });
  const [view, setView] = useState<'lista' | 'mapa'>('lista');
  const brigadesState = useAsync(() => getBrigades(filters), [filters.diseaseId, filters.from, filters.schedule, filters.population, filters.includeFinished]);
  const campaignsState = useAsync(getCampaigns, []);
  const mapState = useAsync(
    () => (view === 'mapa' ? getMapData({ diseaseId: filters.diseaseId, category: 'todas', weeks: 4, regionId: 'todas' }) : Promise.resolve(null)),
    [view, filters.diseaseId],
  );
  const set = <K extends keyof BrigadeFilters>(k: K, v: BrigadeFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <>
      <PageHeader
        eyebrow="Prevención"
        title="Brigadas y campañas sanitarias"
        description="Vacunación y actividades preventivas por zona aproximada, fecha y horario. Escenarios DEMO: no acudir a las sedes señaladas."
      />
      <Notice tone="caution" title="Actividades simuladas">
        Fechas, horarios y sedes son ficticios. Las sedes se describen por zona, sin dirección exacta.
      </Notice>

      <section aria-label="Filtros de brigadas" className="mt-6 grid gap-4 rounded-[14px] bg-paper p-4 sm:grid-cols-2 md:p-5 xl:grid-cols-5 xl:items-end">
        <Field id="b-enf" label="Enfermedad">
          <select id="b-enf" className="input" value={filters.diseaseId} onChange={(e) => set('diseaseId', e.target.value)}>
            <option value="todas">Todas</option>
            {diseases.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field id="b-fecha" label="Desde la fecha">
          <input id="b-fecha" type="date" className="input" value={filters.from} onChange={(e) => set('from', e.target.value)} />
        </Field>
        <Field id="b-horario" label="Horario">
          <select id="b-horario" className="input" value={filters.schedule} onChange={(e) => set('schedule', e.target.value as ScheduleBlock | 'todos')}>
            <option value="todos">Cualquiera</option>
            {(Object.keys(scheduleLabels) as ScheduleBlock[]).map((s) => (
              <option key={s} value={s}>
                {scheduleLabels[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field id="b-pob" label="Población objetivo">
          <select id="b-pob" className="input" value={filters.population} onChange={(e) => set('population', e.target.value as TargetPopulation | 'todas')}>
            <option value="todas">Todas</option>
            {(Object.keys(targetPopulationLabels) as TargetPopulation[]).map((p) => (
              <option key={p} value={p}>
                {targetPopulationLabels[p]}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex min-h-[44px] items-center gap-2 text-[15px]">
          <input type="checkbox" className="h-4 w-4 accent-[#0f3e17]" checked={filters.includeFinished} onChange={(e) => set('includeFinished', e.target.checked)} />
          Incluir finalizadas
        </label>
      </section>

      <div className="mt-6 inline-flex rounded-[12px] bg-paper p-1" role="group" aria-label="Vista">
        {(['lista', 'mapa'] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={`btn btn-sm ${view === v ? 'bg-cream text-forest shadow-[0_0_0_1px_#e4e2dc]' : 'text-muted'}`}
          >
            {v === 'lista' ? <List aria-hidden className="h-4 w-4" /> : <MapIcon aria-hidden className="h-4 w-4" />}
            {v === 'lista' ? 'Lista' : 'Mapa'}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {view === 'mapa' ? (
          mapState.loading ? (
            <LoadingState variant="map" />
          ) : mapState.error ? (
            <ErrorState error={mapState.error} onRetry={mapState.reload} />
          ) : mapState.data ? (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[13.5px] text-muted">
                <DataKindBadge kind="brigada" /> Cuadrado magenta «+N»: número de actividades vigentes en la zona.
              </div>
              <OndaraMap data={mapState.data} visibility={BRIGADE_ONLY} selectedRegionId={null} onSelectRegion={() => setView('lista')} />
            </>
          ) : null
        ) : brigadesState.loading ? (
          <LoadingState variant="list" rows={4} />
        ) : brigadesState.error ? (
          <ErrorState error={brigadesState.error} onRetry={brigadesState.reload} />
        ) : !brigadesState.data?.length ? (
          <EmptyState
            title="No hay brigadas con esos filtros"
            description="Prueba con otra enfermedad, fecha u horario, o incluye las actividades finalizadas."
            action={
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFilters({ diseaseId: 'todas', from: '', schedule: 'todos', population: 'todas', includeFinished: false })}
              >
                Limpiar filtros
              </button>
            }
          />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {brigadesState.data.map((b) => (
              <li key={b.id}>
                <BrigadeCard brigade={b} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Section id="campanas" eyebrow="Campañas" title="Campañas preventivas en curso">
        {campaignsState.loading ? (
          <LoadingState rows={3} />
        ) : campaignsState.error ? (
          <ErrorState error={campaignsState.error} onRetry={campaignsState.reload} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {campaignsState.data?.map((c) => (
              <li key={c.id} className="panel-keylime">
                <span className={`pill ${statusTone[c.status]}`}>{activityStatusLabels[c.status]}</span>
                <h3 className="title-display mt-3 text-[26px]">{c.title}</h3>
                <p className="mt-2 text-[14.5px]">{c.description}</p>
                <p className="mt-3 text-[13px] text-muted">
                  {formatDate(c.startDate)} – {formatDate(c.endDate)} · {c.regionIds.length} zonas
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <SourceNote source={sourceById('src-campanas')} cutoffDate={DEMO_CUTOFF_DATE} />
    </>
  );
}

function BrigadeCard({ brigade: b }: { brigade: VaccinationBrigade }) {
  return (
    <article className="card flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <DataKindBadge kind="brigada" short />
        <span className={`pill ${statusTone[b.status]}`}>{activityStatusLabels[b.status]}</span>
      </div>
      <h2 className="mt-3 text-[19px] font-semibold leading-snug text-forest">{b.title}</h2>
      <ul className="mt-3 space-y-1.5 text-[14.5px]">
        <li className="flex items-center gap-2">
          <CalendarDays aria-hidden className="h-4 w-4 text-muted" />
          {formatLongDate(b.date)}
        </li>
        <li className="flex items-center gap-2">
          <Clock aria-hidden className="h-4 w-4 text-muted" />
          {b.startTime}–{b.endTime} ({scheduleLabels[b.schedule].toLowerCase()})
        </li>
        <li className="flex items-center gap-2">
          <MapPin aria-hidden className="h-4 w-4 text-muted" />
          Zona {regionName(b.regionId)} · {b.approximatePlace}
        </li>
        <li className="flex items-center gap-2">
          <Users aria-hidden className="h-4 w-4 text-muted" />
          {b.targetPopulation.map((p) => targetPopulationLabels[p]).join(', ')}
        </li>
      </ul>
      <p className="mt-3 text-[13px] text-muted">{b.diseaseIds.map((id) => diseaseById(id)?.name).join(' · ')}</p>
      <div className="mt-auto pt-4">
        <Link to={`/brigadas/${b.id}`} className="btn btn-secondary btn-sm">
          Ver requisitos y detalle
        </Link>
      </div>
    </article>
  );
}
