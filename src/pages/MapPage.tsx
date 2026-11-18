import { ChevronDown, Layers, RotateCcw, SlidersHorizontal, Syringe } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { LazyMap } from '../components/map/LazyMap';
import { MapLegend } from '../components/map/MapLegend';
import { ZoneDetail } from '../components/map/ZoneDetail';
import { Button } from '../components/ui/Button';
import { SelectField } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States';
import { TEXTS } from '../config/texts';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { activityStatusLabels } from '../mocks/activities';
import { categoryLabels, categoryOrder, diseases } from '../mocks/diseases';
import { regionName, regions } from '../mocks/regions';
import { periodLabels } from '../services/epidemiologyService';
import { getMapDataset } from '../services/mapService';
import type { DiseaseCategory, MapFilters, MapLayerId, PeriodKey } from '../types';
import { formatDateLong } from '../utils/dates';
import { formatDecimal, formatInteger } from '../utils/format';

const PERIODS: PeriodKey[] = ['ultima', 'ultimas-4', 'ultimas-8', 'ultimas-12'];
const DEFAULT_VISIBLE: Record<MapLayerId, boolean> = {
  oficial: true,
  estimado: false,
  reportes: true,
  observaciones: false,
  brigadas: true,
  vectorial: false,
};

/** En pantallas angostas la capa de brigadas inicia oculta para que los marcadores no se encimen. */
function initialVisibility(): Record<MapLayerId, boolean> {
  const narrow = typeof window !== 'undefined' && !window.matchMedia('(min-width: 640px)').matches;
  return narrow ? { ...DEFAULT_VISIBLE, brigadas: false } : DEFAULT_VISIBLE;
}

function readFilters(params: URLSearchParams): MapFilters {
  const category = params.get('clasificacion');
  const disease = params.get('enfermedad');
  const period = params.get('periodo');
  const zone = params.get('zona');
  return {
    category: category && category in categoryLabels ? (category as DiseaseCategory) : 'todas',
    diseaseId: disease && diseases.some((item) => item.id === disease) ? disease : 'todas',
    period: period && (PERIODS as string[]).includes(period) ? (period as PeriodKey) : 'ultimas-4',
    regionId: zone && regions.some((region) => region.id === zone) ? zone : 'todas',
  };
}

export function MapPage() {
  useDocumentTitle('Mapa epidemiológico');
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);
  const [visible, setVisible] = useState(initialVisibility);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [baseMode, setBaseMode] = useState<'remoto' | 'local' | null>(null);
  const isWide = useMediaQuery('(min-width: 1280px)');
  const toggleLayer = useCallback((layer: MapLayerId, value: boolean) => setVisible((current) => ({ ...current, [layer]: value })), []);
  const { resource, data, reload } = useAsync(
    () => getMapDataset(filters),
    [filters.category, filters.diseaseId, filters.period, filters.regionId],
  );

  const updateFilter = useCallback(
    (key: 'clasificacion' | 'enfermedad' | 'periodo' | 'zona', value: string) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (value === 'todas' || (key === 'periodo' && value === 'ultimas-4')) next.delete(key);
          else next.set(key, value);
          if (key === 'clasificacion' && value !== 'todas') {
            const disease = diseases.find((item) => item.id === next.get('enfermedad'));
            if (disease && disease.category !== value) next.delete('enfermedad');
          }
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setParams],
  );

  const selectRegion = useCallback((regionId: string | null) => updateFilter('zona', regionId ?? 'todas'), [updateFilter]);
  const selectActivity = useCallback((activityId: string) => setSelectedActivityId(activityId), []);
  const selectedRegionId = filters.regionId === 'todas' ? null : filters.regionId;
  const diseaseOptions = diseases.filter((disease) => filters.category === 'todas' || disease.category === filters.category);
  const activeLayers = Object.values(visible).filter(Boolean).length;
  const selectedActivity = data?.activities.find((activity) => activity.id === selectedActivityId);
  const officialEmpty = data !== undefined && data.zones.every((zone) => zone.oficial.count === 0);
  const filtersChanged = params.toString().length > 0;
  const activeFilterCount = ['clasificacion', 'enfermedad', 'periodo', 'zona'].filter((key) => params.has(key)).length;
  // En móvil los filtros empiezan plegados para que el mapa quede en la primera pantalla.
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Datos por zona"
        title="Mapa epidemiológico"
        description="Agregados por zonas amplias de Cancún. Ningún punto representa a una persona ni un domicilio."
      />

      <button
        type="button"
        className="mb-3 inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-card bg-border-mist/60 px-4 text-[0.9375rem] font-semibold text-forest-ink sm:hidden"
        aria-expanded={filtersOpen}
        aria-controls="filtros-mapa"
        onClick={() => setFiltersOpen((open) => !open)}
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </span>
        <ChevronDown className={`size-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <form
        id="filtros-mapa"
        className={`mb-5 ${filtersOpen ? 'grid' : 'hidden'} grid-cols-1 gap-3 rounded-card bg-border-mist/60 p-4 sm:grid sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]`}
        aria-label="Filtros del mapa"
        onSubmit={(event) => event.preventDefault()}
      >
        <SelectField
          label="Clasificación"
          value={filters.category}
          onChange={(event) => updateFilter('clasificacion', event.target.value)}
        >
          <option value="todas">Todas</option>
          {categoryOrder.map((category) => (
            <option key={category} value={category}>
              {categoryLabels[category]}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Enfermedad o señal"
          value={filters.diseaseId}
          onChange={(event) => updateFilter('enfermedad', event.target.value)}
        >
          <option value="todas">Todas{filters.category !== 'todas' ? ' las de esta clasificación' : ''}</option>
          {diseaseOptions.map((disease) => (
            <option key={disease.id} value={disease.id}>
              {disease.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Periodo" value={filters.period} onChange={(event) => updateFilter('periodo', event.target.value)}>
          {PERIODS.map((period) => (
            <option key={period} value={period}>
              {periodLabels[period]}
            </option>
          ))}
        </SelectField>
        <SelectField label="Zona" value={filters.regionId} onChange={(event) => updateFilter('zona', event.target.value)}>
          <option value="todas">Todas las zonas</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </SelectField>
        <div className="flex items-end">
          <Button
            variant="ghost"
            icon={RotateCcw}
            disabled={!filtersChanged}
            onClick={() => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true })}
            className="w-full xl:w-auto"
          >
            Restablecer
          </Button>
        </div>
      </form>

      {data && (
        <p className="mb-4 text-sm text-muted" aria-live="polite">
          <span className="font-semibold text-charcoal">{data.diseaseLabel}</span> · {data.periodLabel} · Registros ilustrativos
          con corte al {data.officialCutoff}; reportes ciudadanos actualizados el {data.participationUpdatedAt}.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="min-w-0 space-y-4">
          {!isWide && (
            <details className="rounded-card border border-border-mist p-3">
              <summary className="cursor-pointer py-2 font-semibold text-forest-ink">
                <Layers className="mr-2 inline size-5 align-[-0.2em]" aria-hidden="true" />
                Capas y leyenda ({activeLayers} activas)
              </summary>
              <div className="mt-3">
                <MapLegend dataset={data} visible={visible} onToggle={toggleLayer} />
              </div>
            </details>
          )}

          <div className="relative">
            {resource.status === 'error' && !data ? (
              <ErrorState error={resource.error} onRetry={reload} className="h-[55vh] min-h-80" />
            ) : data ? (
              <>
                <LazyMap
                  className="h-[58vh] min-h-80 lg:h-[560px]"
                  dataset={data}
                  visible={visible}
                  selectedRegionId={selectedRegionId}
                  selectedActivityId={selectedActivityId}
                  onSelectRegion={selectRegion}
                  onSelectActivity={selectActivity}
                  onBaseModeChange={setBaseMode}
                />
                {resource.status === 'loading' && (
                  <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center" role="status">
                    <span className="rounded-full bg-cream-paper px-3 py-1 text-sm text-charcoal">Actualizando capas…</span>
                  </div>
                )}
                {resource.status === 'error' && (
                  <div className="absolute inset-x-3 top-3">
                    <ErrorState error={resource.error} onRetry={reload} title="No se pudieron actualizar las capas" />
                  </div>
                )}
                {officialEmpty && visible.oficial && (
                  <div className="absolute inset-x-3 bottom-10 sm:inset-x-auto sm:left-3 sm:max-w-sm">
                    <EmptyState
                      headingLevel="h2"
                      title="Sin registros ilustrativos"
                      description="No hay registros para esta combinación de enfermedad y periodo. Selecciona un periodo más amplio."
                      action={
                        <Button size="sm" variant="secondary" onClick={() => updateFilter('periodo', 'ultimas-12')}>
                          Ver últimas 12 semanas
                        </Button>
                      }
                      className="py-5"
                    />
                  </div>
                )}
              </>
            ) : (
              <div role="status" aria-live="polite">
                <span className="sr-only">Cargando capas del mapa…</span>
                <Skeleton className="h-[58vh] min-h-80 lg:h-[560px]" />
              </div>
            )}
          </div>

          {baseMode === 'local' && (
            <Notice tone="info" title="Mapa base esquemático">
              No se pudo cargar el mapa base de OpenFreeMap (sin conexión o red bloqueada). Se muestra una costa aproximada dibujada
              como referencia visual; las capas y los datos no cambian.
            </Notice>
          )}

          {(visible.reportes || visible.observaciones) && <Notice tone="info">{TEXTS.participationCaveat}</Notice>}

          {selectedActivity && (
            <div className="flex flex-col gap-3 rounded-card bg-brigada-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm text-brigada-700">
                  <Syringe className="size-4" aria-hidden="true" />
                  {selectedActivity.type === 'brigada-vacunacion' ? 'Brigada de vacunación' : 'Campaña preventiva'} ·{' '}
                  {activityStatusLabels[selectedActivity.status]}
                </p>
                <p className="font-semibold text-charcoal">{selectedActivity.title}</p>
                <p className="text-sm text-muted">
                  {formatDateLong(selectedActivity.date)}, {selectedActivity.startTime}–{selectedActivity.endTime} ·{' '}
                  {regionName(selectedActivity.regionId)} (ubicación aproximada)
                </p>
              </div>
              <Link className="btn btn-secondary btn-sm shrink-0" to={`/brigadas/${selectedActivity.id}`}>
                Ver detalle
              </Link>
            </div>
          )}

          {data && (
            <details className="rounded-card border border-border-mist p-3">
              <summary className="cursor-pointer py-2.5 font-semibold text-forest-ink">
                Ver los datos del mapa en una tabla
              </summary>
              <div className="relative mt-3 overflow-x-auto" tabIndex={0} aria-label="Tabla de datos del mapa, desplazable">
                <table className="table-base min-w-[44rem]">
                  <caption className="pb-2 text-left text-sm text-muted">
                    {data.diseaseLabel} · {data.periodLabel}. Conteos ciudadanos menores a 3 se muestran como «&lt;3».
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Zona</th>
                      <th scope="col" className="text-right">
                        Ilustrativos (registros)
                      </th>
                      <th scope="col" className="text-right">
                        Estimado (por 10 mil hab.)
                      </th>
                      <th scope="col" className="text-right">
                        Reportes sin verificar
                      </th>
                      <th scope="col" className="text-right">
                        Observaciones revisadas
                      </th>
                      <th scope="col" className="text-right">
                        Ovitrampas positivas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {data.zones.map((zone) => (
                      <tr key={zone.regionId}>
                        <th scope="row" className="font-medium">
                          <button type="button" className="link text-left" onClick={() => selectRegion(zone.regionId)}>
                            {regionName(zone.regionId)}
                          </button>
                        </th>
                        <td className="text-right">{formatInteger(zone.oficial.count)}</td>
                        <td className="text-right">≈ {formatDecimal(zone.estimado.ratePer10k)}</td>
                        <td className="text-right">{zone.reportes.display}</td>
                        <td className="text-right">{zone.observaciones.display}</td>
                        <td className="text-right">{zone.vectorial ? `${formatDecimal(zone.vectorial.positivityPct)} %` : 'No aplica'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>

        <aside className="space-y-4" aria-label="Detalle y capas">
          {data && selectedRegionId && (
            <ZoneDetail
              dataset={data}
              regionId={selectedRegionId}
              visible={visible}
              diseaseId={filters.diseaseId}
              onClose={() => selectRegion(null)}
            />
          )}
          {!selectedRegionId && (
            <p className="rounded-card bg-keylime-wash p-4 text-sm leading-relaxed">
              Selecciona una zona en el mapa, en una ficha o en el filtro «Zona» para ver el detalle de cada capa con su fuente,
              fecha de actualización, cobertura, periodo y advertencias.
            </p>
          )}
          {isWide && <MapLegend dataset={data} visible={visible} onToggle={toggleLayer} />}
        </aside>
      </div>
    </>
  );
}
