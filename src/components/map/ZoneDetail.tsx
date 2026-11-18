/**
 * Detalle de una zona: valor de cada capa con su fuente, fecha de actualización,
 * cobertura, periodo y advertencia de interpretación.
 */
import { CalendarClock, Database, MapPinned, TriangleAlert, X } from 'lucide-react';
import { Link } from 'react-router';
import { MAP_LAYERS, type MapLayerMeta } from '../../config/mapLayers';
import { regionById } from '../../mocks/regions';
import { getDataSourcesSnapshot } from '../../services/sourceService';
import type { MapDataset, MapLayerId, ZoneLayerValues } from '../../types';
import { formatDateLong } from '../../utils/dates';
import { formatDecimal, formatInteger } from '../../utils/format';
import { DataKindBadge, DemoTag } from '../ui/Badges';
import { MetaItem } from '../ui/MetaItem';

const LAYER_SOURCE: Record<MapLayerId, string> = {
  oficial: 'fuente-registro-semanal',
  estimado: 'fuente-poblacion',
  reportes: 'fuente-reportes',
  observaciones: 'fuente-moderacion',
  brigadas: 'fuente-agenda-brigadas',
  vectorial: 'fuente-entomologica',
};

function layerValue(layer: MapLayerId, zone: ZoneLayerValues, activities: number): string {
  switch (layer) {
    case 'oficial':
      return `${formatInteger(zone.oficial.count)} registros`;
    case 'estimado':
      return `≈ ${formatDecimal(zone.estimado.ratePer10k)} por 10 mil hab.`;
    case 'reportes':
      return `${zone.reportes.display} sin verificar`;
    case 'observaciones':
      return `${zone.observaciones.display} revisadas`;
    case 'brigadas':
      return `${activities} en los próximos 14 días`;
    case 'vectorial':
      return zone.vectorial
        ? `${formatDecimal(zone.vectorial.positivityPct)} % de ovitrampas positivas (${formatInteger(zone.vectorial.trapsInspected)} revisadas)`
        : 'No aplica para la selección';
  }
}

function LayerBlock({
  layer,
  value,
  updated,
  period,
  visible,
}: {
  layer: MapLayerMeta;
  value: string;
  updated: string;
  period: string;
  visible: boolean;
}) {
  const source = getDataSourcesSnapshot().find((item) => item.id === LAYER_SOURCE[layer.id]);
  const Icon = layer.icon;
  return (
    <li className="rounded-[12px] border border-border-mist bg-cream-paper p-3.5">
      <div className="flex items-start gap-2.5">
        <span
          className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: layer.id === 'oficial' ? '#4f8f57' : layer.color, color: layer.iconInk }}
          aria-hidden="true"
        >
          <Icon className="size-3.5" strokeWidth={2.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-charcoal">
            {layer.label}
            {!visible && <span className="font-normal text-muted">(capa oculta)</span>}
          </p>
          <p className="mt-0.5 text-[1.0625rem] font-semibold text-forest-ink">{value}</p>
          <div className="mt-1.5">
            <DataKindBadge kind={layer.dataKind} compact />
          </div>
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-forest-ink underline-offset-2 hover:underline">Fuente y advertencia</summary>
            <dl className="mt-2 space-y-2">
              <MetaItem icon={Database} term="Fuente">
                {source ? source.name : 'Fuente de referencia'}
              </MetaItem>
              <MetaItem icon={CalendarClock} term="Actualización y periodo">
                {updated} · {period}
              </MetaItem>
              <MetaItem icon={MapPinned} term="Cobertura">
                {source?.coverage ?? 'Zonas de referencia'}
              </MetaItem>
              <MetaItem icon={TriangleAlert} term="Advertencia">
                {layer.limitation}
              </MetaItem>
            </dl>
          </details>
        </div>
      </div>
    </li>
  );
}

export function ZoneDetail({
  dataset,
  regionId,
  visible,
  diseaseId,
  onClose,
}: {
  dataset: MapDataset;
  regionId: string;
  visible: Record<MapLayerId, boolean>;
  diseaseId: string;
  onClose: () => void;
}) {
  const region = regionById.get(regionId);
  const zone = dataset.zones.find((item) => item.regionId === regionId);
  if (!region || !zone) return null;
  const activities = dataset.activities.filter((activity) => activity.regionId === regionId);

  return (
    <section aria-labelledby="zona-detalle" className="rounded-card bg-keylime-wash p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Zona seleccionada</p>
          <h2 id="zona-detalle" className="text-[1.625rem]">
            {region.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mr-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-forest-ink hover:bg-mint-veil"
          aria-label="Quitar la selección de zona"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-1 text-sm leading-relaxed">{region.description}</p>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
        Población estimada: {formatInteger(region.populationEstimate)} <DemoTag />
      </p>

      <ul className="mt-4 space-y-2.5">
        {MAP_LAYERS.map((layer) => {
          const isParticipation = layer.id === 'reportes' || layer.id === 'observaciones';
          const updated =
            isParticipation
              ? dataset.participationUpdatedAt
              : layer.id === 'brigadas'
                ? 'Agenda vigente'
                : `Corte ${dataset.officialCutoff}`;
          const period = isParticipation
            ? `${dataset.periodLabel} y semana en curso`
            : layer.id === 'brigadas'
              ? 'Próximos 14 días'
              : dataset.periodLabel;
          return (
            <LayerBlock
              key={layer.id}
              layer={layer}
              value={layerValue(layer.id, zone, activities.length)}
              updated={updated}
              period={period}
              visible={visible[layer.id]}
            />
          );
        })}
      </ul>

      {activities.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-charcoal">Brigadas y campañas en la zona</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {activities.map((activity) => (
              <li key={activity.id}>
                <Link className="link font-normal" to={`/brigadas/${activity.id}`}>
                  {activity.title}
                </Link>{' '}
                <span className="text-muted">· {formatDateLong(activity.date)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {diseaseId !== 'todas' && (
        <Link className="link mt-4 inline-block text-sm" to={`/enfermedades/${diseaseId}?zona=${regionId}`}>
          Ver la tendencia de esta zona
        </Link>
      )}
    </section>
  );
}
