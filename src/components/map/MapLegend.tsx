/**
 * Control de capas y leyenda. Cada capa tiene su propio interruptor y su propia
 * entrada de leyenda (color + icono + texto); los datos oficiales DEMO y los
 * reportes ciudadanos nunca comparten leyenda.
 */
import { Megaphone } from 'lucide-react';
import { useId } from 'react';
import { MAP_LAYERS, OFFICIAL_SCALE, type MapLayerMeta } from '../../config/mapLayers';
import type { MapDataset, MapLayerId } from '../../types';
import { DataKindBadge } from '../ui/Badges';

function LayerSymbol({ layer }: { layer: MapLayerMeta }) {
  const Icon = layer.icon;
  if (layer.id === 'oficial') {
    return <span className="inline-block size-5 shrink-0 rounded-[4px]" style={{ backgroundColor: OFFICIAL_SCALE[4] }} aria-hidden="true" />;
  }
  return (
    <span
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: layer.color, color: layer.iconInk }}
      aria-hidden="true"
    >
      <Icon className="size-3" strokeWidth={2.5} />
    </span>
  );
}

function OfficialScale({ breaks }: { breaks: number[] }) {
  if (breaks.length === 0) {
    return <p className="mt-2 text-xs text-muted">Sin registros en la selección actual.</p>;
  }
  const classes = [
    { label: '0', color: OFFICIAL_SCALE[0] },
    ...breaks.map((limit, index) => ({
      label: `${index === 0 ? 1 : (breaks[index - 1] ?? 0) + 1}–${limit}`,
      color: OFFICIAL_SCALE[index + 1] ?? OFFICIAL_SCALE[5],
    })),
  ];
  return (
    <div className="mt-2">
      <p className="text-xs text-muted">Registros ilustrativos en el periodo, por zona</p>
      <ul className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-1 text-xs tabular-nums">
        {classes.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="inline-block h-3 w-4 rounded-[3px] border border-line/40" style={{ backgroundColor: item.color }} aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MapLegend({
  dataset,
  visible,
  onToggle,
  layers = MAP_LAYERS.map((layer) => layer.id),
}: {
  dataset: MapDataset | undefined;
  visible: Record<MapLayerId, boolean>;
  onToggle: (layer: MapLayerId, value: boolean) => void;
  layers?: MapLayerId[];
}) {
  const uid = useId();
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 font-semibold text-charcoal">Capas del mapa</legend>
      {MAP_LAYERS.filter((layer) => layers.includes(layer.id)).map((layer) => {
        const disabled = layer.id === 'vectorial' && dataset !== undefined && !dataset.vectorAvailable;
        const inputId = `${uid}-capa-${layer.id}`;
        return (
          <div key={layer.id} className="rounded-[12px] border border-border-mist bg-cream-paper p-3">
            <div className="flex items-start gap-3">
              <input
                id={inputId}
                type="checkbox"
                role="switch"
                className="mt-1 size-5 shrink-0 cursor-pointer accent-forest-ink disabled:cursor-not-allowed"
                checked={visible[layer.id] && !disabled}
                disabled={disabled}
                onChange={(event) => onToggle(layer.id, event.target.checked)}
                aria-describedby={`${inputId}-desc`}
              />
              <div className="min-w-0 flex-1">
                <label htmlFor={inputId} className="flex cursor-pointer flex-wrap items-center gap-2 font-medium text-charcoal">
                  <LayerSymbol layer={layer} />
                  {layer.label}
                </label>
                <div className="mt-1.5">
                  <DataKindBadge kind={layer.dataKind} compact />
                </div>
                <p id={`${inputId}-desc`} className="mt-1.5 text-sm text-muted">
                  {disabled ? 'No aplica para la enfermedad o señal elegida (solo enfermedades transmitidas por vector).' : layer.description}
                </p>
                {layer.id === 'oficial' && visible.oficial && dataset && <OfficialScale breaks={dataset.officialBreaks} />}
                {layer.id === 'brigadas' && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                    <Megaphone className="size-3.5" aria-hidden="true" /> Megáfono: campaña preventiva · Jeringa: brigada de vacunación
                  </p>
                )}
                <details className="mt-1.5 text-sm">
                  <summary className="cursor-pointer text-forest-ink underline-offset-2 hover:underline">Cómo leer esta capa</summary>
                  <p className="mt-1 text-muted">
                    <span className="font-medium text-charcoal">Símbolo:</span> {layer.symbol}.
                  </p>
                  {layer.method && (
                    <p className="mt-1 text-muted">
                      <span className="font-medium text-charcoal">Método:</span> {layer.method}
                    </p>
                  )}
                  <p className="mt-1 text-muted">
                    <span className="font-medium text-charcoal">Limitación:</span> {layer.limitation}
                  </p>
                </details>
              </div>
            </div>
          </div>
        );
      })}
    </fieldset>
  );
}
