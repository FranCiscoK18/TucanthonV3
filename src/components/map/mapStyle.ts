/**
 * Estilos del mapa base.
 *
 * - Remoto: OpenFreeMap «Positron» (https://openfreemap.org), estilo vectorial libre,
 *   sin clave de API, con datos © colaboradores de OpenStreetMap (OpenMapTiles).
 * - Local de respaldo: si el estilo remoto no carga (sin conexión o red bloqueada),
 *   se usa un mapa esquemático de la costa dibujado a mano. No requiere red ni glifos.
 */
import type { FeatureCollection } from 'geojson';
import type { LngLatBoundsLike, StyleSpecification } from 'maplibre-gl';
import { regionById } from '../../mocks/regions';

export const REMOTE_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

/** Extensión de las zonas DEMO de Cancún. */
export const CANCUN_BOUNDS: LngLatBoundsLike = [
  [-86.915, 21.025],
  [-86.73, 21.225],
];

export const MAX_BOUNDS: LngLatBoundsLike = [
  [-87.25, 20.8],
  [-86.45, 21.45],
];

/** Tierra firme simplificada: costa norte, bahía y orilla poniente de la laguna Nichupté (aproximada). */
const MAINLAND: Array<[number, number]> = [
  [-87.1, 21.32],
  [-86.802, 21.32],
  [-86.797, 21.27],
  [-86.8, 21.232],
  [-86.802, 21.212],
  [-86.804, 21.198],
  [-86.807, 21.186],
  [-86.812, 21.173],
  [-86.809, 21.161],
  [-86.812, 21.147],
  [-86.82, 21.133],
  [-86.823, 21.112],
  [-86.826, 21.093],
  [-86.824, 21.074],
  [-86.812, 21.055],
  [-86.798, 21.04],
  [-86.792, 21.02],
  [-86.81, 20.96],
  [-87.1, 20.96],
  [-87.1, 21.32],
];

const hotelZone = regionById.get('zona-hotelera')?.polygon ?? [];

const SCHEMATIC_BASE: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { tipo: 'tierra' }, geometry: { type: 'Polygon', coordinates: [MAINLAND] } },
    {
      type: 'Feature',
      properties: { tipo: 'tierra' },
      geometry: { type: 'Polygon', coordinates: [hotelZone.map(([lng, lat]) => [lng, lat])] },
    },
  ],
};

export const LOCAL_FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  name: 'Ondara · mapa esquemático local',
  sources: {
    'base-esquematica': {
      type: 'geojson',
      data: SCHEMATIC_BASE,
      attribution: 'Costa esquemática (DEMO)',
    },
  },
  layers: [
    { id: 'agua', type: 'background', paint: { 'background-color': '#d7e6ea' } },
    { id: 'tierra', type: 'fill', source: 'base-esquematica', paint: { 'fill-color': '#f6f4ee' } },
    { id: 'costa', type: 'line', source: 'base-esquematica', paint: { 'line-color': '#a9bcc2', 'line-width': 1 } },
  ],
};

export const MAP_LOCALE: Record<string, string> = {
  'AttributionControl.ToggleAttribution': 'Mostrar u ocultar atribución',
  'AttributionControl.MapFeedback': 'Comentarios sobre el mapa',
  'CooperativeGesturesHandler.WindowsHelpText': 'Usa Ctrl + rueda para acercar o alejar el mapa',
  'CooperativeGesturesHandler.MacHelpText': 'Usa ⌘ + rueda para acercar o alejar el mapa',
  'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa',
  'FullscreenControl.Enter': 'Pantalla completa',
  'FullscreenControl.Exit': 'Salir de pantalla completa',
  'Map.Title': 'Mapa',
  'NavigationControl.ResetBearing': 'Restablecer el norte',
  'NavigationControl.ZoomIn': 'Acercar',
  'NavigationControl.ZoomOut': 'Alejar',
  'ScaleControl.Kilometers': 'km',
  'ScaleControl.Meters': 'm',
};
