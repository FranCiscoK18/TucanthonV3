import { Layers, MapPin, Table2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MAP_LAYER_ORDER, OndaraMap, displayCount, type MapLayerId } from '../components/map/OndaraMap';
import { DataKindBadge } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { Field } from '../components/ui/Form';
import { PageHeader, SourceNote } from '../components/ui/Layout';
import { DATA_KINDS } from '../config/dataKinds';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { diseaseCategoryLabels, diseases } from '../mocks/diseases';
import { regions } from '../mocks/regions';
import { getMapData, SMALL_COUNT_THRESHOLD, type MapData, type MapFilters, type RegionLayerData } from '../services/epidemiologyService';
import type { DataSource, DiseaseCategory, PeriodWeeks } from '../types';
import { formatDate, weekLabel } from '../utils/dates';
import { formatDecimal, formatNumber } from '../utils/format';

const LAYER_SOURCE: Record<MapLayerId, string> = {
  oficial: 'src-oficial',
  estimado: 'src-estimado',
  ciudadano: 'src-ciudadano',
  revisado: 'src-ciudadano',
  brigada: 'src-campanas',
  vector: 'src-vector',
};

const LAYER_WARNING: Record<MapLayerId, string> = {
  oficial: 'Conteos agregados simulados. No equivalen a incidencia real ni permiten ubicar personas.',
  estimado:
    'Método: registros DEMO del periodo ÷ población estimada de la zona × 10 000. La población es una proyección simulada; la tasa no es incidencia clínica.',
  ciudadano: 'Observaciones sin verificar. Más reportes pueden reflejar más participación, no más riesgo. No son casos.',
  revisado: 'Revisadas como observación útil. No confirman ningún caso ni diagnóstico.',
  brigada: 'Actividades simuladas ubicadas por zona aproximada. No acudir: no son jornadas convocadas.',
  vector: 'Índice simulado de ovitrampas positivas. Indica presencia de huevos de mosquito, no transmisión. Muestreo parcial.',
};

const DEFAULT_VISIBILITY: Record<MapLayerId, boolean> = {
  oficial: true,
  estimado: false,
  ciudadano: true,
  revisado: true,
  brigada: true,
  vector: false,
};

export default function MapPage() {
  useDocumentTitle('Mapa epidemiológico');
  const [filters, setFilters] = useState<MapFilters>({ diseaseId: 'todas', category: 'todas', weeks: 4, regionId: 'todas' });
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const { data, loading, error, reload } = useAsync(() => getMapData(filters), [filters.diseaseId, filters.category, filters.weeks, filters.regionId]);

  const availableDiseases = useMemo(
    () => diseases.filter((d) => filters.category === 'todas' || d.category === filters.category),
    [filters.category],
  );

  const update = <K extends keyof MapFilters>(key: K, value: MapFilters[K]) => {
    setFilters((f) => {
      const next = { ...f, [key]: value };
      // Si la enfermedad no pertenece a la clasificación elegida, se reinicia.
      if (key === 'category' && value !== 'todas' && f.diseaseId !== 'todas' && diseases.find((d) => d.id === f.diseaseId)?.category !== value) {
        next.diseaseId = 'todas';
      }
      return next;
    });
    if (key === 'regionId') setSelectedId(value === 'todas' ? null : String(value));
  };

  const selected = data?.regions.find((r) => r.region.id === selectedId) ?? null;
  const activeCount = MAP_LAYER_ORDER.filter((l) => visibility[l]).length;

  return (
    <>
      <PageHeader
        eyebrow="Mapa epidemiológico"
        title="Cancún por capas"
        description="Cada tipo de dato vive en su propia capa, con su color, forma y leyenda. Solo se muestran agregados por zona amplia: nunca domicilios ni puntos individuales."
      />

      {/* Filtros */}
      <section aria-label="Filtros del mapa" className="rounded-[14px] bg-paper p-3 md:p-5">
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          <Field id="f-clasificacion" label="Clasificación">
            <select
              id="f-clasificacion"
              className="input"
              value={filters.category}
              onChange={(e) => update('category', e.target.value as DiseaseCategory | 'todas')}
            >
              <option value="todas">Todas</option>
              {(Object.keys(diseaseCategoryLabels) as DiseaseCategory[]).map((c) => (
                <option key={c} value={c}>
                  {diseaseCategoryLabels[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="f-enfermedad" label="Enfermedad o señal">
            <select id="f-enfermedad" className="input" value={filters.diseaseId} onChange={(e) => update('diseaseId', e.target.value)}>
              <option value="todas">Todas</option>
              {availableDiseases.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="f-periodo" label="Periodo">
            <select
              id="f-periodo"
              className="input"
              value={filters.weeks}
              onChange={(e) => update('weeks', Number(e.target.value) as PeriodWeeks)}
            >
              <option value={4}>Últimas 4 semanas</option>
              <option value={8}>Últimas 8 semanas</option>
              <option value={12}>Últimas 12 semanas</option>
            </select>
          </Field>
          <Field id="f-zona" label="Zona">
            <select id="f-zona" className="input" value={filters.regionId} onChange={(e) => update('regionId', e.target.value)}>
              <option value="todas">Todas las zonas</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          {/* Capas */}
          <fieldset className="rounded-[14px] border border-hairline p-4">
            <legend className="flex items-center gap-2 px-1 text-[14px] font-semibold">
              <Layers aria-hidden className="h-4 w-4" />
              Capas y leyenda ({activeCount} de 6 activas)
            </legend>
            <ul className="mt-1 grid grid-cols-2 gap-1 sm:gap-2 lg:grid-cols-3">
              {MAP_LAYER_ORDER.map((layer) => (
                <li key={layer}>
                  <LayerToggle
                    layer={layer}
                    checked={visibility[layer]}
                    onChange={(checked) => setVisibility((v) => ({ ...v, [layer]: checked }))}
                  />
                </li>
              ))}
            </ul>
            {visibility.oficial && <ChoroplethScale max={data?.maxOfficial} />}
          </fieldset>

          {loading && !data ? (
            <LoadingState variant="map" label="Preparando mapa y capas DEMO…" />
          ) : error ? (
            <ErrorState error={error} onRetry={reload} />
          ) : data ? (
            <div className={loading ? 'opacity-60 transition-opacity' : ''} aria-busy={loading}>
              {activeCount === 0 && (
                <Notice tone="caution" className="mb-3" title="No hay capas activas">
                  Activa al menos una capa para ver información sobre el mapa.
                </Notice>
              )}
              <OndaraMap data={data} visibility={visibility} selectedRegionId={selectedId} onSelectRegion={setSelectedId} />
              <p className="mt-2 text-[13px] text-muted">
                Polígonos ilustrativos, no límites oficiales. Conteos ciudadanos menores a {SMALL_COUNT_THRESHOLD} se muestran como «&lt;
                {SMALL_COUNT_THRESHOLD}» para proteger la privacidad.
              </p>
            </div>
          ) : null}

          <button type="button" className="btn btn-ghost btn-sm" aria-expanded={showTable} onClick={() => setShowTable((s) => !s)}>
            <Table2 aria-hidden className="h-4 w-4" />
            {showTable ? 'Ocultar tabla de zonas' : 'Ver tabla de zonas (alternativa accesible al mapa)'}
          </button>
          {showTable && data && <ZoneTable data={data} visibility={visibility} onSelect={setSelectedId} />}
        </div>

        {/* Panel lateral */}
        <aside aria-label="Detalle de zona" className="xl:sticky xl:top-20 xl:self-start">
          {data && selected ? (
            <ZoneDetail data={data} item={selected} visibility={visibility} onClose={() => setSelectedId(null)} />
          ) : data && data.regions.length === 0 ? (
            <EmptyState title="Sin zonas" description="Los filtros no devolvieron zonas. Cambia la zona o el periodo." />
          ) : (
            <div className="panel-keylime">
              <MapPin aria-hidden className="mb-3 h-6 w-6 text-forest" />
              <p className="title-display text-[26px]">Selecciona una zona</p>
              <p className="mt-2 text-[15px]">
                Toca una zona o un marcador del mapa, o elige una zona en el filtro, para ver su fuente, fecha de actualización, cobertura,
                periodo y advertencias de interpretación.
              </p>
            </div>
          )}
        </aside>
      </div>
      {data && <SourceNote cutoffDate={data.cutoffDate}>Mapa base © colaboradores de OpenStreetMap.</SourceNote>}
    </>
  );
}

function LayerToggle({ layer, checked, onChange }: { layer: MapLayerId; checked: boolean; onChange: (checked: boolean) => void }) {
  const info = DATA_KINDS[layer];
  const Icon = info.icon;
  const id = `capa-${layer}`;
  return (
    <label
      htmlFor={id}
      className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-[10px] p-2.5 transition-colors ${checked ? 'bg-paper' : 'opacity-75 hover:bg-paper'}`}
    >
      <input id={id} type="checkbox" className="mt-1 h-4 w-4 accent-[#0f3e17]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <LegendSwatch layer={layer} />
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[13px] font-medium sm:text-[14px]" style={{ color: info.color }}>
          <Icon aria-hidden className="h-3.5 w-3.5 shrink-0" />
          {info.label}
        </span>
        <span className="hidden text-[12.5px] text-muted sm:block">{info.mapShape}</span>
      </span>
    </label>
  );
}

/** Muestra de la forma del símbolo en la leyenda. */
function LegendSwatch({ layer }: { layer: MapLayerId }) {
  const color = DATA_KINDS[layer].color;
  const common = 'mt-0.5 shrink-0';
  switch (layer) {
    case 'oficial':
      return <span aria-hidden className={`${common} h-5 w-5 rounded-[4px]`} style={{ background: 'linear-gradient(135deg,#c9e6c9,#1d5a2c)' }} />;
    case 'estimado':
      return <span aria-hidden className={`${common} h-5 w-5 rounded-[4px] border-2 border-dashed`} style={{ borderColor: color }} />;
    case 'ciudadano':
      return <span aria-hidden className={`${common} h-5 w-5 rounded-full`} style={{ background: color }} />;
    case 'revisado':
      return <span aria-hidden className={`${common} m-0.5 h-4 w-4 rotate-45 rounded-[2px]`} style={{ background: color }} />;
    case 'brigada':
      return (
        <span aria-hidden className={`${common} grid h-5 w-5 place-items-center rounded-[5px] text-[13px] font-bold text-white`} style={{ background: color }}>
          +
        </span>
      );
    case 'vector':
      return (
        <span
          aria-hidden
          className={`${common} h-5 w-5`}
          style={{ background: color, clipPath: 'polygon(25% 4%, 75% 4%, 100% 50%, 75% 96%, 25% 96%, 0 50%)' }}
        />
      );
  }
}

function ChoroplethScale({ max }: { max?: number }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 text-[12.5px] text-muted">
      <span>Datos oficiales DEMO:</span>
      <span className="inline-flex items-center gap-2">
        0
        <span aria-hidden className="h-2.5 w-32 rounded-full" style={{ background: 'linear-gradient(90deg,#eef6ec,#c9e6c9,#8cc49a,#4a8f5c,#1d5a2c)' }} />
        {max !== undefined ? formatNumber(max) : 'máx.'} registros en el periodo
      </span>
    </div>
  );
}

function layerValue(layer: MapLayerId, d: RegionLayerData): string {
  switch (layer) {
    case 'oficial':
      return `${formatNumber(d.official)} registros`;
    case 'estimado':
      return `${formatDecimal(d.estimatedRate)} por 10 000 hab. est.`;
    case 'ciudadano':
      return `${displayCount(d.citizenUnverified)} sin verificar`;
    case 'revisado':
      return `${displayCount(d.reviewed)} revisadas`;
    case 'brigada':
      return `${d.brigades.length} programadas`;
    case 'vector':
      return d.vectorPositivity === null ? 'Sin muestreo en el periodo' : `${Math.round(d.vectorPositivity)} % (${d.vectorWeeksSampled} sem. muestreadas)`;
  }
}

function ZoneDetail({
  data,
  item,
  visibility,
  onClose,
}: {
  data: MapData;
  item: RegionLayerData;
  visibility: Record<MapLayerId, boolean>;
  onClose: () => void;
}) {
  const period = `${weekLabel(data.weeks[0] ?? '')} a ${weekLabel(data.weeks[data.weeks.length - 1] ?? '')} de 2026`;
  const sourceOf = (layer: MapLayerId): DataSource | undefined => data.sources.find((s) => s.id === LAYER_SOURCE[layer]);
  const layers = MAP_LAYER_ORDER.filter((l) => visibility[l]);
  return (
    <div className="card" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Zona seleccionada</p>
          <h2 className="title-display mt-1 text-[30px]">{item.region.name}</h2>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Cerrar detalle de zona">
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-[14px] text-muted">{item.region.description}</p>
      <p className="mt-2 text-[13.5px]">
        <span className="font-semibold">Periodo: </span>
        {period}
      </p>
      {layers.length === 0 && <p className="mt-4 text-[14px] text-muted">Activa una capa para ver sus datos.</p>}
      <ul className="mt-4 space-y-3">
        {layers.map((layer) => {
          const source = sourceOf(layer);
          return (
            <li key={layer} className="rounded-[12px] bg-paper p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <DataKindBadge kind={layer} short />
                <span className="text-[15px] font-semibold tabular-nums">{layerValue(layer, item)}</span>
              </div>
              {source && (
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[12.5px]">
                  <dt className="font-semibold">Fuente</dt>
                  <dd className="text-muted">
                    <Link className="link" to={`/normativa#fuente-${source.id}`}>
                      {source.name}
                    </Link>
                  </dd>
                  <dt className="font-semibold">Actualización</dt>
                  <dd className="text-muted">{formatDate(source.cutoffDate)}</dd>
                  <dt className="font-semibold">Cobertura</dt>
                  <dd className="text-muted">{source.coverage}</dd>
                </dl>
              )}
              <p className="mt-2 text-[12.5px] text-ink">
                <span className="font-semibold">Interpretación: </span>
                {LAYER_WARNING[layer]}
              </p>
              {layer === 'brigada' && item.brigades.length > 0 && (
                <ul className="mt-2 space-y-1 text-[13px]">
                  {item.brigades.map((b) => (
                    <li key={b.id}>
                      <Link className="link" to={`/brigadas/${b.id}`}>
                        {b.title}
                      </Link>{' '}
                      <span className="text-muted">· {formatDate(b.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ZoneTable({ data, visibility, onSelect }: { data: MapData; visibility: Record<MapLayerId, boolean>; onSelect: (id: string) => void }) {
  const layers = MAP_LAYER_ORDER.filter((l) => visibility[l]);
  if (layers.length === 0) return <EmptyState title="Sin capas activas" description="Activa una capa para ver la tabla." />;
  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="sr-only">Valores por zona de las capas activas</caption>
        <thead>
          <tr>
            <th scope="col">Zona</th>
            {layers.map((l) => (
              <th key={l} scope="col">
                {DATA_KINDS[l].shortLabel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.regions.map((d) => (
            <tr key={d.region.id}>
              <th scope="row" className="!bg-transparent">
                <button type="button" className="link text-left" onClick={() => onSelect(d.region.id)}>
                  {d.region.name}
                </button>
              </th>
              {layers.map((l) => (
                <td key={l}>{layerValue(l, d)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
