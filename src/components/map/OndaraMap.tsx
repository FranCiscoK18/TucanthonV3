/**
 * Mapa MapLibre de Cancún con capas DEMO separadas.
 * - Zonas (GeoJSON): relleno secuencial de la capa oficial y contorno seleccionable.
 * - Marcadores HTML (botones accesibles) para indicadores estimados, reportes sin verificar,
 *   observaciones revisadas, vigilancia vectorial y brigadas. Cada capa tiene su propio
 *   color, icono y etiqueta; nunca se combinan en un mismo símbolo.
 * Se carga bajo demanda (React.lazy) para no pesar en las demás vistas.
 */
import {
  AttributionControl,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type GeoJSONSource,
  type LngLatBoundsLike,
  type MapLayerMouseEvent,
} from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Megaphone } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MAP_LAYER_META, OFFICIAL_SCALE } from '../../config/mapLayers';
import { regionById, regions } from '../../mocks/regions';
import type { HealthActivity, MapDataset, MapLayerId, ZoneLayerValues } from '../../types';
import { cx } from '../../utils/cx';
import { formatDecimal } from '../../utils/format';
import { CANCUN_BOUNDS, LOCAL_FALLBACK_STYLE, MAP_LOCALE, MAX_BOUNDS, REMOTE_STYLE_URL } from './mapStyle';

setWorkerUrl(workerUrl);

type ZoneMarkerLayer = Exclude<MapLayerId, 'oficial' | 'brigadas'>;

/** Posición de cada ficha alrededor del ancla de la zona (cuadrícula 2 × 2). */
const ZONE_OFFSETS: Record<ZoneMarkerLayer, [number, number]> = {
  estimado: [-34, -15],
  reportes: [34, -15],
  observaciones: [-34, 15],
  vectorial: [34, 15],
};

const ZONE_LAYERS: ZoneMarkerLayer[] = ['estimado', 'reportes', 'observaciones', 'vectorial'];

export interface OndaraMapProps {
  dataset: MapDataset;
  visible: Record<MapLayerId, boolean>;
  selectedRegionId: string | null;
  selectedActivityId?: string | null;
  onSelectRegion: (regionId: string | null) => void;
  onSelectActivity?: (activityId: string) => void;
  onBaseModeChange?: (mode: 'remoto' | 'local') => void;
  className?: string;
}

interface MarkerHost {
  key: string;
  element: HTMLElement;
  render: () => ReactNode;
}

function zoneBounds(regionId: string): LngLatBoundsLike | null {
  const region = regionById.get(regionId);
  if (!region) return null;
  const lngs = region.polygon.map(([lng]) => lng);
  const lats = region.polygon.map(([, lat]) => lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

/** Texto de la ficha; `null` si no hay nada que mostrar (los ceros se omiten para no saturar el mapa). */
function zoneValueText(layer: ZoneMarkerLayer, values: ZoneLayerValues): string | null {
  switch (layer) {
    case 'estimado':
      return values.estimado.ratePer10k > 0 ? `≈${formatDecimal(values.estimado.ratePer10k)}` : null;
    case 'reportes':
      return values.reportes.value > 0 ? values.reportes.display : null;
    case 'observaciones':
      return values.observaciones.value > 0 ? values.observaciones.display : null;
    case 'vectorial':
      return values.vectorial ? `${Math.round(values.vectorial.positivityPct)} %` : null;
  }
}

function ZoneChip({
  layer,
  value,
  zoneName,
  selected,
  onSelect,
}: {
  layer: ZoneMarkerLayer;
  value: string;
  zoneName: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const meta = MAP_LAYER_META[layer];
  const Icon = meta.icon;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      aria-label={`${meta.label}, ${zoneName}: ${value}${layer === 'estimado' ? ' por 10 mil habitantes' : ''}. Ver detalle de la zona.`}
      className={cx(
        'ondara-marker flex items-center gap-1 rounded-full bg-cream-paper py-[3px] pl-[3px] pr-2 text-[0.8125rem] font-semibold leading-none text-charcoal tabular-nums',
        layer === 'estimado' ? 'border border-dashed' : 'border border-line/50',
      )}
      style={{
        boxShadow: selected ? '0 0 0 2px #fffefc, 0 0 0 4px #0f3e17' : '0 0 0 2px #fffefc',
        borderColor: layer === 'estimado' ? meta.color : undefined,
      }}
    >
      <span
        className="inline-flex size-5 items-center justify-center rounded-full"
        style={{ backgroundColor: meta.color, color: meta.iconInk }}
        aria-hidden="true"
      >
        <Icon className="size-3" strokeWidth={2.5} />
      </span>
      {value}
    </button>
  );
}

function ActivityPin({ activity, selected, onSelect }: { activity: HealthActivity; selected: boolean; onSelect: () => void }) {
  const meta = MAP_LAYER_META.brigadas;
  const Icon = activity.type === 'brigada-vacunacion' ? meta.icon : Megaphone;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      aria-label={`${activity.type === 'brigada-vacunacion' ? 'Brigada' : 'Campaña'}: ${activity.title}. Ubicación aproximada. Ver detalle.`}
      className="ondara-marker inline-flex size-8 items-center justify-center rounded-full"
      style={{
        backgroundColor: meta.color,
        color: meta.iconInk,
        boxShadow: selected ? '0 0 0 2px #fffefc, 0 0 0 5px #0f3e17' : '0 0 0 2px #fffefc',
      }}
    >
      <Icon className="size-4" strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}

export default function OndaraMap({
  dataset,
  visible,
  selectedRegionId,
  selectedActivityId = null,
  onSelectRegion,
  onSelectActivity,
  onBaseModeChange,
  className,
}: OndaraMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef(new Map<string, { marker: Marker; element: HTMLElement }>());
  const [styleVersion, setStyleVersion] = useState(0);
  const [failure, setFailure] = useState<string | null>(null);
  const [hosts, setHosts] = useState<MarkerHost[]>([]);
  const hoveredRef = useRef<string | null>(null);
  const onSelectRegionRef = useRef(onSelectRegion);
  const onBaseModeRef = useRef(onBaseModeChange);

  useEffect(() => {
    onSelectRegionRef.current = onSelectRegion;
    onBaseModeRef.current = onBaseModeChange;
  });

  // 1. Crear el mapa una sola vez.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container,
        style: REMOTE_STYLE_URL,
        bounds: CANCUN_BOUNDS,
        fitBoundsOptions: { padding: 24 },
        maxBounds: MAX_BOUNDS,
        minZoom: 9.5,
        maxZoom: 16,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        cooperativeGestures: true,
        attributionControl: false,
        locale: MAP_LOCALE,
      });
    } catch {
      setFailure('Tu navegador no pudo iniciar el mapa (WebGL no disponible). Consulta los datos en la tabla.');
      return;
    }
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new AttributionControl({ compact: true }), 'bottom-right');

    let usingFallback = false;
    let firstIdle = false;
    const useFallback = () => {
      if (usingFallback) return;
      usingFallback = true;
      onBaseModeRef.current?.('local');
      map.setStyle(LOCAL_FALLBACK_STYLE, { diff: false });
    };
    const timer = window.setTimeout(() => {
      if (!firstIdle) useFallback();
    }, 8000);

    map.on('error', (event) => {
      const sourceId = (event as { sourceId?: unknown }).sourceId;
      if (typeof sourceId === 'string' && sourceId.startsWith('ondara-')) return;
      // Un fallo del mapa base antes de terminar de dibujarse activa el respaldo local.
      if (!firstIdle) useFallback();
    });
    map.once('idle', () => {
      firstIdle = true;
      window.clearTimeout(timer);
      if (!usingFallback) onBaseModeRef.current?.('remoto');
    });

    map.on('style.load', () => {
      const firstSymbol = map.getStyle().layers.find((layer) => layer.type === 'symbol')?.id;
      map.addSource('ondara-zonas', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        promoteId: 'id',
      });
      map.addLayer(
        { id: 'ondara-zonas-base', type: 'fill', source: 'ondara-zonas', paint: { 'fill-color': '#fffefc', 'fill-opacity': 0.25 } },
        firstSymbol,
      );
      map.addLayer(
        {
          id: 'ondara-oficial',
          type: 'fill',
          source: 'ondara-zonas',
          paint: {
            'fill-color': [
              'match',
              ['get', 'bin'],
              1, OFFICIAL_SCALE[1],
              2, OFFICIAL_SCALE[2],
              3, OFFICIAL_SCALE[3],
              4, OFFICIAL_SCALE[4],
              5, OFFICIAL_SCALE[5],
              6, OFFICIAL_SCALE[6],
              7, OFFICIAL_SCALE[7],
              OFFICIAL_SCALE[0],
            ],
            'fill-opacity': 0.84,
          },
        },
        firstSymbol,
      );
      map.addLayer(
        {
          id: 'ondara-zonas-borde',
          type: 'line',
          source: 'ondara-zonas',
          paint: {
            'line-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#0f3e17', '#46534a'],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              3.5,
              ['boolean', ['feature-state', 'hover'], false],
              2,
              1,
            ],
            'line-opacity': 0.9,
          },
        },
        firstSymbol,
      );
      setStyleVersion((version) => version + 1);
    });

    const handleClick = (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.id;
      if (typeof id === 'string') onSelectRegionRef.current(id);
    };
    const handleMove = (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.id;
      map.getCanvas().style.cursor = 'pointer';
      if (typeof id !== 'string' || id === hoveredRef.current) return;
      if (hoveredRef.current) map.setFeatureState({ source: 'ondara-zonas', id: hoveredRef.current }, { hover: false });
      hoveredRef.current = id;
      map.setFeatureState({ source: 'ondara-zonas', id }, { hover: true });
    };
    const handleLeave = () => {
      map.getCanvas().style.cursor = '';
      if (hoveredRef.current && map.getSource('ondara-zonas')) {
        map.setFeatureState({ source: 'ondara-zonas', id: hoveredRef.current }, { hover: false });
      }
      hoveredRef.current = null;
    };
    map.on('click', 'ondara-zonas-base', handleClick);
    map.on('mousemove', 'ondara-zonas-base', handleMove);
    map.on('mouseleave', 'ondara-zonas-base', handleLeave);

    const observer = new ResizeObserver(() => map.resize());
    observer.observe(container);

    const markers = markersRef.current;
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      markers.forEach(({ marker }) => marker.remove());
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Datos de las zonas (se reaplican si cambia el estilo base).
  useEffect(() => {
    const map = mapRef.current;
    const source = map?.getSource<GeoJSONSource>('ondara-zonas');
    if (!map || !source) return;
    const byId = new Map(dataset.zones.map((zone) => [zone.regionId, zone]));
    source.setData({
      type: 'FeatureCollection',
      features: regions.map((region) => ({
        type: 'Feature',
        id: region.id,
        properties: { id: region.id, name: region.name, bin: byId.get(region.id)?.oficial.bin ?? 0 },
        geometry: { type: 'Polygon', coordinates: [region.polygon.map(([lng, lat]) => [lng, lat])] },
      })),
    });
  }, [dataset, styleVersion]);

  // 3. Visibilidad de la capa oficial y selección de zona.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer('ondara-oficial')) return;
    map.setLayoutProperty('ondara-oficial', 'visibility', visible.oficial ? 'visible' : 'none');
  }, [visible.oficial, styleVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource('ondara-zonas')) return;
    for (const region of regions) {
      map.setFeatureState({ source: 'ondara-zonas', id: region.id }, { selected: region.id === selectedRegionId });
    }
  }, [selectedRegionId, styleVersion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = selectedRegionId ? zoneBounds(selectedRegionId) : CANCUN_BOUNDS;
    if (!bounds) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.fitBounds(bounds, { padding: selectedRegionId ? 70 : 24, maxZoom: 13.5, duration: reduceMotion ? 0 : 700 });
  }, [selectedRegionId]);

  // 4. Marcadores HTML (se agregan, actualizan o quitan según capas visibles y datos).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const wanted: Array<{ key: string; lngLat: [number, number]; offset: [number, number]; render: () => ReactNode }> = [];

    for (const zone of dataset.zones) {
      const region = regionById.get(zone.regionId);
      if (!region) continue;
      for (const layer of ZONE_LAYERS) {
        if (!visible[layer]) continue;
        const value = zoneValueText(layer, zone);
        if (value === null) continue;
        wanted.push({
          key: `${layer}:${zone.regionId}`,
          lngLat: [region.anchor[0], region.anchor[1]],
          offset: ZONE_OFFSETS[layer],
          render: () => (
            <ZoneChip
              layer={layer}
              value={value}
              zoneName={region.name}
              selected={selectedRegionId === region.id}
              onSelect={() => onSelectRegion(region.id)}
            />
          ),
        });
      }
    }
    if (visible.brigadas) {
      for (const activity of dataset.activities) {
        wanted.push({
          key: `brigada:${activity.id}`,
          lngLat: [activity.approxPoint[0], activity.approxPoint[1]],
          offset: [0, 0],
          render: () => (
            <ActivityPin
              activity={activity}
              selected={selectedActivityId === activity.id}
              onSelect={() => onSelectActivity?.(activity.id)}
            />
          ),
        });
      }
    }

    const markers = markersRef.current;
    const wantedKeys = new Set(wanted.map((item) => item.key));
    for (const [key, { marker }] of markers) {
      if (!wantedKeys.has(key)) {
        marker.remove();
        markers.delete(key);
      }
    }
    for (const item of wanted) {
      const existing = markers.get(item.key);
      if (existing) {
        existing.marker.setLngLat(item.lngLat).setOffset(item.offset);
        continue;
      }
      const element = document.createElement('div');
      element.className = 'ondara-marker-host';
      const marker = new Marker({ element, offset: item.offset, anchor: 'center' }).setLngLat(item.lngLat).addTo(map);
      markers.set(item.key, { marker, element });
    }
    setHosts(
      wanted.flatMap((item) => {
        const entry = markers.get(item.key);
        return entry ? [{ key: item.key, element: entry.element, render: item.render }] : [];
      }),
    );
  }, [dataset, visible, selectedRegionId, selectedActivityId, onSelectRegion, onSelectActivity]);

  if (failure) {
    return (
      <div className={cx('flex items-center justify-center rounded-card bg-border-mist p-6 text-center', className)} role="alert">
        {failure}
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className={cx('overflow-hidden rounded-card', className)}
        role="region"
        aria-label="Mapa de Cancún con capas de datos. Usa las fichas del mapa o el selector de zona para ver detalles."
      />
      {hosts.map((host) => createPortal(host.render(), host.element, host.key))}
    </>
  );
}
