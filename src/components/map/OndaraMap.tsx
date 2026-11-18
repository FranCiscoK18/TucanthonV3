import maplibregl, { type GeoJSONSource, type Map as MLMap, type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import { DATA_KINDS } from '../../config/dataKinds';
import { SMALL_COUNT_THRESHOLD, type MapData, type RegionLayerData } from '../../services/epidemiologyService';
import { formatDecimal } from '../../utils/format';
import type { FeatureCollection, Polygon } from 'geojson';

/** Capas del mapa: se activan y desactivan por separado. */
export type MapLayerId = 'oficial' | 'estimado' | 'ciudadano' | 'revisado' | 'brigada' | 'vector';

export const MAP_LAYER_ORDER: MapLayerId[] = ['oficial', 'estimado', 'ciudadano', 'revisado', 'brigada', 'vector'];

/**
 * Mapa base: teselas raster públicas de OpenStreetMap
 * (https://tile.openstreetmap.org, licencia ODbL, uso moderado según su
 * política). Para producción se recomienda un proveedor propio o con
 * acuerdo de uso. Si no cargan, las capas DEMO siguen visibles.
 */
const BASE_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">colaboradores de OpenStreetMap</a>',
    },
  },
  layers: [
    { id: 'fondo', type: 'background', paint: { 'background-color': '#eef0ea' } },
    { id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.7, 'raster-opacity': 0.85 } },
  ],
};

const CANCUN_BOUNDS: [[number, number], [number, number]] = [
  [-86.905, 21.035],
  [-86.74, 21.22],
];

/** Desplazamiento (px) de cada marcador respecto al centroide de la zona. */
const MARKER_OFFSETS: Record<Exclude<MapLayerId, 'oficial'>, [number, number]> = {
  estimado: [0, 0],
  ciudadano: [-32, -32],
  revisado: [32, -32],
  vector: [-32, 32],
  brigada: [32, 32],
};

const MARKER_SHAPES: Record<Exclude<MapLayerId, 'oficial'>, string> = {
  estimado: 'pill',
  ciudadano: 'circle',
  revisado: 'diamond',
  vector: 'hexagon',
  brigada: 'square',
};

export function displayCount(n: number): string {
  if (n > 0 && n < SMALL_COUNT_THRESHOLD) return `<${SMALL_COUNT_THRESHOLD}`;
  return String(n);
}

function markerContent(layer: Exclude<MapLayerId, 'oficial'>, d: RegionLayerData): { text: string; label: string } | null {
  const zone = d.region.name;
  switch (layer) {
    case 'estimado':
      return { text: `≈${formatDecimal(d.estimatedRate)}`, label: `Indicador estimado en ${zone}: ${formatDecimal(d.estimatedRate)} por 10 000 habitantes estimados` };
    case 'ciudadano':
      return d.citizenUnverified > 0
        ? { text: displayCount(d.citizenUnverified), label: `Reportes ciudadanos sin verificar en ${zone}: ${displayCount(d.citizenUnverified)}` }
        : null;
    case 'revisado':
      return d.reviewed > 0 ? { text: displayCount(d.reviewed), label: `Observaciones revisadas en ${zone}: ${displayCount(d.reviewed)}` } : null;
    case 'vector':
      return d.vectorPositivity !== null
        ? { text: `${Math.round(d.vectorPositivity)}%`, label: `Índice vectorial DEMO en ${zone}: ${Math.round(d.vectorPositivity)} % de ovitrampas positivas` }
        : null;
    case 'brigada':
      return d.brigades.length > 0
        ? { text: `+${d.brigades.length}`, label: `${d.brigades.length} brigadas o campañas DEMO en ${zone}` }
        : null;
  }
}

function toGeoJson(data: MapData): FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: data.regions.map((d) => ({
      type: 'Feature',
      id: d.region.id,
      properties: { id: d.region.id, name: d.region.name, ratio: d.official / data.maxOfficial },
      geometry: { type: 'Polygon', coordinates: [d.region.polygon] },
    })),
  };
}

export function OndaraMap({
  data,
  visibility,
  selectedRegionId,
  onSelectRegion,
}: {
  data: MapData;
  visibility: Record<MapLayerId, boolean>;
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const onSelectRef = useRef(onSelectRegion);
  const [ready, setReady] = useState(false);
  const [baseError, setBaseError] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  onSelectRef.current = onSelectRegion;

  // Crear el mapa una sola vez.
  useEffect(() => {
    if (!containerRef.current) return;
    let map: MLMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: BASE_STYLE,
        bounds: CANCUN_BOUNDS,
        fitBoundsOptions: { padding: 24 },
        attributionControl: { compact: true },
        cooperativeGestures: false,
        dragRotate: false,
        pitchWithRotate: false,
      });
    } catch {
      setUnsupported(true);
      return;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.touchZoomRotate.disableRotation();

    map.on('load', () => {
      map.addSource('zonas', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'oficial-relleno',
        type: 'fill',
        source: 'zonas',
        paint: {
          'fill-color': ['interpolate', ['linear'], ['get', 'ratio'], 0, '#eef6ec', 0.25, '#c9e6c9', 0.5, '#8cc49a', 0.75, '#4a8f5c', 1, '#1d5a2c'],
          'fill-opacity': 0.62,
        },
      });
      map.addLayer({ id: 'zonas-borde', type: 'line', source: 'zonas', paint: { 'line-color': '#5f6b61', 'line-width': 1 } });
      map.addLayer({
        id: 'estimado-contorno',
        type: 'line',
        source: 'zonas',
        paint: { 'line-color': DATA_KINDS.estimado.color, 'line-width': 2.5, 'line-dasharray': [2, 1.5] },
      });
      map.addLayer({
        id: 'seleccion',
        type: 'line',
        source: 'zonas',
        filter: ['==', ['get', 'id'], ''],
        paint: { 'line-color': '#111111', 'line-width': 3.5 },
      });
      map.on('click', 'oficial-relleno', (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (typeof id === 'string') onSelectRef.current(id);
      });
      map.on('click', 'zonas-borde', (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (typeof id === 'string') onSelectRef.current(id);
      });
      map.on('mouseenter', 'oficial-relleno', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', 'oficial-relleno', () => (map.getCanvas().style.cursor = ''));
      setReady(true);
    });

    map.on('error', (e) => {
      const sourceId = (e as unknown as { sourceId?: string }).sourceId;
      if (sourceId === 'osm') setBaseError(true);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Datos de zonas (relleno oficial y contornos).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    (map.getSource('zonas') as GeoJSONSource | undefined)?.setData(toGeoJson(data));
  }, [data, ready]);

  // Visibilidad de capas de polígono.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setLayoutProperty('oficial-relleno', 'visibility', visibility.oficial ? 'visible' : 'none');
    map.setLayoutProperty('estimado-contorno', 'visibility', visibility.estimado ? 'visible' : 'none');
  }, [visibility.oficial, visibility.estimado, ready]);

  // Selección.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setFilter('seleccion', ['==', ['get', 'id'], selectedRegionId ?? '']);
  }, [selectedRegionId, ready]);

  // Marcadores HTML (accesibles con teclado) para capas de conteo.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    const markerLayers = MAP_LAYER_ORDER.filter((l): l is Exclude<MapLayerId, 'oficial'> => l !== 'oficial' && visibility[l]);
    for (const d of data.regions) {
      for (const layer of markerLayers) {
        const content = markerContent(layer, d);
        if (!content) continue;
        const kind = DATA_KINDS[layer];
        const el = document.createElement('button');
        el.type = 'button';
        el.className = `ondara-marker ondara-marker--${MARKER_SHAPES[layer]}`;
        el.style.background = kind.color;
        el.dataset.selected = String(d.region.id === selectedRegionId);
        el.setAttribute('aria-label', `${content.label}. Ver detalle de la zona.`);
        el.title = `${kind.label} · ${d.region.name}`;
        const span = document.createElement('span');
        span.textContent = content.text;
        el.appendChild(span);
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          onSelectRef.current(d.region.id);
        });
        const marker = new maplibregl.Marker({ element: el, offset: MARKER_OFFSETS[layer] }).setLngLat(d.region.centroid).addTo(map);
        markersRef.current.push(marker);
      }
    }
  }, [data, visibility, selectedRegionId, ready]);

  if (unsupported) {
    return (
      <div className="grid h-[420px] place-items-center rounded-[14px] bg-paper p-6 text-center text-[15px]">
        Tu navegador no admite WebGL, necesario para el mapa. Consulta la tabla de zonas, que contiene la misma información.
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[58dvh] min-h-[360px] w-full overflow-hidden rounded-[14px] border border-hairline md:h-[560px]"
        role="region"
        aria-label="Mapa de Cancún con capas DEMO por zona. Los marcadores son botones; también puedes usar la tabla de zonas."
      />
      {!ready && <div className="skeleton absolute inset-0 rounded-[14px]" aria-hidden />}
      {baseError && (
        <p className="absolute left-3 right-14 top-3 rounded-[10px] bg-cream/95 px-3 py-2 text-[13px] text-ink md:right-auto md:max-w-md" role="status">
          No se pudo cargar el mapa base (requiere Internet). Las capas DEMO por zona siguen visibles.
        </p>
      )}
    </div>
  );
}
