/**
 * Metadatos de las seis capas del mapa: cada una tiene color, icono, leyenda y
 * limitación propios. Los datos oficiales DEMO y los reportes ciudadanos nunca
 * comparten símbolo, color ni leyenda.
 */
import { Bug, ClipboardCheck, Landmark, MessageSquareText, Sigma, Syringe, type LucideIcon } from 'lucide-react';
import type { DataKind, MapLayerId } from '../types';
import { MIN_PUBLIC_COUNT, VECTOR_THRESHOLD_PCT } from './demo';
import { TEXTS } from './texts';

export interface MapLayerMeta {
  id: MapLayerId;
  /** Color del icono dentro del círculo de la capa (blanco o tinta según la luminancia). */
  iconInk: '#ffffff' | '#222222';
  label: string;
  shortLabel: string;
  dataKind: DataKind;
  icon: LucideIcon;
  /** Color principal de la capa (marcas y bordes). */
  color: string;
  /** Fondo claro para marcadores y fichas. */
  tint: string;
  /** Color de texto con contraste AA sobre `tint`. */
  ink: string;
  symbol: string;
  description: string;
  method?: string;
  limitation: string;
}

/** Escala secuencial de la capa oficial: clase 0 (sin registros) y clases 1–5. */
export const OFFICIAL_SCALE = ['#f1f0ec', '#e2f1de', '#bfe0b8', '#8cc287', '#4f8f57', '#1f5a2b'] as const;

export const MAP_LAYERS: MapLayerMeta[] = [
  {
    id: 'oficial',
    iconInk: '#ffffff',
    label: 'Datos oficiales DEMO',
    shortLabel: 'Oficial DEMO',
    dataKind: 'oficial-demo',
    icon: Landmark,
    color: '#2f6b3a',
    tint: '#e1f4df',
    ink: '#0f3e17',
    symbol: 'Relleno verde por zona (más oscuro = más registros)',
    description: 'Registros notificados agregados por zona y semana, simulados como si vinieran de un registro oficial.',
    limitation: 'Serie inventada: no proviene de ninguna autoridad. Las semanas recientes podrían corregirse.',
  },
  {
    id: 'estimado',
    iconInk: '#ffffff',
    label: 'Indicadores estimados',
    shortLabel: 'Estimado',
    dataKind: 'estimado',
    icon: Sigma,
    color: '#2a78d6',
    tint: '#e6effa',
    ink: '#1c4f8f',
    symbol: 'Ficha con borde punteado, círculo azul y «≈»',
    description: 'Tasa estimada de registros oficiales DEMO por cada 10 mil habitantes.',
    method: 'Registros oficiales DEMO del periodo ÷ población estimada DEMO de la zona × 10 000.',
    limitation: 'La población es una estimación DEMO, no un dato censal. Útil para comparar zonas, no para inferir riesgo individual.',
  },
  {
    id: 'reportes',
    iconInk: '#ffffff',
    label: 'Reportes ciudadanos sin verificar',
    shortLabel: 'Sin verificar',
    dataKind: 'reporte-ciudadano',
    icon: MessageSquareText,
    color: '#c4522a',
    tint: '#fbeae3',
    ink: '#8a3417',
    symbol: 'Ficha de conteo con círculo terracota',
    description: 'Conteo agregado de reportes pendientes o en revisión en la zona. Nunca se muestran puntos individuales.',
    limitation: `${TEXTS.participationCaveat} Los conteos menores a ${MIN_PUBLIC_COUNT} se publican como «<${MIN_PUBLIC_COUNT}».`,
  },
  {
    id: 'observaciones',
    iconInk: '#ffffff',
    label: 'Observaciones revisadas',
    shortLabel: 'Revisadas',
    dataKind: 'reporte-ciudadano',
    icon: ClipboardCheck,
    color: '#a8418f',
    tint: '#f6e7f2',
    ink: '#74285f',
    symbol: 'Ficha de conteo con círculo ciruela',
    description: 'Reportes que moderación revisó como observación útil.',
    limitation: 'Revisar una observación no confirma un caso ni un riesgo comprobado.',
  },
  {
    id: 'brigadas',
    iconInk: '#222222',
    label: 'Brigadas y campañas',
    shortLabel: 'Brigadas',
    dataKind: 'simulado',
    icon: Syringe,
    color: '#1baf7a',
    tint: '#def4ea',
    ink: '#0f5e43',
    symbol: 'Marcador redondo aqua con jeringa',
    description: 'Actividades programadas en los próximos 14 días, en ubicación aproximada dentro de la zona.',
    limitation: 'Eventos ficticios: no acudas a las sedes señaladas.',
  },
  {
    id: 'vectorial',
    iconInk: '#222222',
    label: 'Vigilancia entomológica DEMO',
    shortLabel: 'Vectorial',
    dataKind: 'oficial-demo',
    icon: Bug,
    color: '#eda100',
    tint: '#fdf1d2',
    ink: '#6b4a00',
    symbol: 'Ficha con círculo amarillo y porcentaje',
    description: 'Porcentaje de ovitrampas con huevos de mosquito en el periodo (puntos de muestreo simulados).',
    method: `Ovitrampas positivas ÷ ovitrampas revisadas × 100. Umbral DEMO de referencia: ${VECTOR_THRESHOLD_PCT} %.`,
    limitation: 'Indica presencia de huevos en puntos de muestreo; no equivale a casos ni a riesgo individual.',
  },
];

export const MAP_LAYER_META = Object.fromEntries(MAP_LAYERS.map((layer) => [layer.id, layer])) as Record<
  MapLayerId,
  MapLayerMeta
>;
