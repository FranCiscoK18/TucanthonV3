import { List, Map as MapIcon, RotateCcw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ActivityCard } from '../components/ActivityCard';
import { activitiesDataset, ONLY_BRIGADES } from '../components/map/activitiesDataset';
import { LazyMap } from '../components/map/LazyMap';
import { Button } from '../components/ui/Button';
import { SelectField } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { PageHeader } from '../components/ui/PageHeader';
import { SourceMeta } from '../components/ui/SourceMeta';
import { AsyncContent, EmptyState, LoadingState } from '../components/ui/States';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { targetPopulationLabels } from '../mocks/activities';
import { diseases } from '../mocks/diseases';
import { regions } from '../mocks/regions';
import {
  defaultActivityFilters,
  getActivities,
  type ActivityFilters,
  type DateRangeFilter,
  type ScheduleFilter,
} from '../services/activityService';
import { getDataSourcesSnapshot } from '../services/sourceService';
import type { TargetPopulation } from '../types';
import { cx } from '../utils/cx';

export function BrigadesPage() {
  useDocumentTitle('Brigadas y campañas');
  const [filters, setFilters] = useState<ActivityFilters>(defaultActivityFilters);
  const [view, setView] = useState<'lista' | 'mapa'>('lista');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isWide = useMediaQuery('(min-width: 1280px)');
  const showMap = isWide || view === 'mapa';
  const { resource, data, reload } = useAsync(() => getActivities(filters), [filters]);
  const dataset = useMemo(() => activitiesDataset(data ?? []), [data]);
  const source = getDataSourcesSnapshot().find((item) => item.id === 'fuente-agenda-brigadas');
  const changed = JSON.stringify(filters) !== JSON.stringify(defaultActivityFilters);

  const update = <K extends keyof ActivityFilters>(key: K, value: ActivityFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const selectActivity = useCallback((id: string) => setSelectedId(id), []);
  const noopRegion = useCallback(() => undefined, []);

  return (
    <>
      <PageHeader
        eyebrow="Agenda de referencia"
        title="Brigadas y campañas sanitarias"
        description="Vacunación y prevención por zona, con ubicación aproximada. Las sedes son referencias generales de espacios públicos."
      />

      <Notice tone="caution" title="Agenda ilustrativa" className="mb-6">
        Las actividades y sedes de esta agenda son ilustrativas, no convocatorias reales. Consulta las campañas confirmadas
        con la autoridad sanitaria antes de acudir.
      </Notice>

      <form
        className="mb-6 grid grid-cols-1 gap-3 rounded-card bg-border-mist/60 p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"
        aria-label="Filtros de brigadas y campañas"
        onSubmit={(event) => event.preventDefault()}
      >
        <SelectField label="Enfermedad" value={filters.diseaseId} onChange={(event) => update('diseaseId', event.target.value)}>
          <option value="todas">Todas</option>
          {diseases.map((disease) => (
            <option key={disease.id} value={disease.id}>
              {disease.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Fecha" value={filters.dateRange} onChange={(event) => update('dateRange', event.target.value as DateRangeFilter)}>
          <option value="proximos-7">Próximos 7 días</option>
          <option value="proximos-14">Próximos 14 días</option>
          <option value="incluir-pasadas">Todas, incluidas las pasadas</option>
        </SelectField>
        <SelectField label="Horario" value={filters.schedule} onChange={(event) => update('schedule', event.target.value as ScheduleFilter)}>
          <option value="todos">Cualquier horario</option>
          <option value="manana">Por la mañana (antes de 12:00)</option>
          <option value="tarde">Por la tarde (desde 12:00)</option>
        </SelectField>
        <SelectField
          label="Población objetivo"
          value={filters.target}
          onChange={(event) => update('target', event.target.value as TargetPopulation | 'todas')}
        >
          <option value="todas">Todas</option>
          {(Object.keys(targetPopulationLabels) as TargetPopulation[]).map((target) => (
            <option key={target} value={target}>
              {targetPopulationLabels[target]}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Tipo"
          value={filters.type}
          onChange={(event) => update('type', event.target.value as ActivityFilters['type'])}
        >
          <option value="todas">Brigadas y campañas</option>
          <option value="brigada-vacunacion">Brigadas de vacunación</option>
          <option value="campana-preventiva">Campañas preventivas</option>
        </SelectField>
        <SelectField label="Zona" value={filters.regionId} onChange={(event) => update('regionId', event.target.value)}>
          <option value="todas">Todas las zonas</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </SelectField>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {data ? `${data.length} ${data.length === 1 ? 'actividad' : 'actividades'}` : 'Cargando…'}
        </p>
        <div className="flex items-center gap-2">
          {changed && (
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => setFilters(defaultActivityFilters)}>
              Restablecer filtros
            </Button>
          )}
          <div className="inline-flex rounded-[12px] bg-border-mist p-1 xl:hidden" role="group" aria-label="Vista">
            {(['lista', 'mapa'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
                className={cx(
                  'inline-flex min-h-10 items-center gap-1.5 rounded-[9px] px-3 text-sm font-medium',
                  view === option ? 'bg-cream-paper text-forest-ink' : 'text-muted',
                )}
              >
                {option === 'lista' ? <List className="size-4" aria-hidden="true" /> : <MapIcon className="size-4" aria-hidden="true" />}
                {option === 'lista' ? 'Lista' : 'Mapa'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h2 className="sr-only">Actividades encontradas</h2>
      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={3} />}>
        {(activities) =>
          activities.length === 0 ? (
            <EmptyState
              title="No hay actividades con estos filtros"
              description="Selecciona otra fecha, horario o población objetivo, o incluye las actividades pasadas."
              action={
                <Button variant="secondary" onClick={() => setFilters(defaultActivityFilters)}>
                  Restablecer filtros
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
              <ul className={cx('grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2', view === 'mapa' && 'hidden xl:grid')}>
                {activities.map((activity) => (
                  <li key={activity.id}>
                    <ActivityCard
                      activity={activity}
                      selected={selectedId === activity.id}
                      onShowOnMap={() => {
                        setSelectedId(activity.id);
                        setView('mapa');
                      }}
                    />
                  </li>
                ))}
              </ul>
              {showMap && (
              <div className="xl:sticky xl:top-20 xl:self-start">
                <LazyMap
                  className="h-[60vh] min-h-80 xl:h-[520px]"
                  dataset={dataset}
                  visible={ONLY_BRIGADES}
                  selectedRegionId={null}
                  selectedActivityId={selectedId}
                  onSelectRegion={noopRegion}
                  onSelectActivity={selectActivity}
                />
                {selectedId && (
                  <div className="mt-3">
                    {activities
                      .filter((activity) => activity.id === selectedId)
                      .map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} selected />
                      ))}
                  </div>
                )}
              </div>
              )}
            </div>
          )
        }
      </AsyncContent>

      {source && <SourceMeta source={source} className="mt-10" />}
    </>
  );
}
