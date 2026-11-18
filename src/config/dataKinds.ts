import { Bug, Calculator, Diamond, FlaskConical, Landmark, MessageCircle, Syringe, type LucideIcon } from 'lucide-react';

/**
 * Tipos de dato visualmente diferenciados. Cada uno tiene color, icono,
 * forma en el mapa y etiqueta textual: la identidad nunca depende solo del color.
 */
export type DataKind = 'oficial' | 'estimado' | 'ciudadano' | 'revisado' | 'brigada' | 'vector' | 'simulado';

export interface DataKindInfo {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** Color sólido (texto, borde o relleno de marcador con texto blanco). */
  color: string;
  /** Fondo suave para insignias. */
  bg: string;
  /** Forma en el mapa (descrita en la leyenda). */
  mapShape: string;
  description: string;
}

export const DATA_KINDS: Record<DataKind, DataKindInfo> = {
  oficial: {
    label: 'Dato oficial DEMO',
    shortLabel: 'Oficial DEMO',
    icon: Landmark,
    color: '#0f3e17',
    bg: '#e1f4df',
    mapShape: 'Relleno de zona en verdes (más oscuro = más registros)',
    description: 'Agregados con forma de datos oficiales, pero simulados. Nunca individuales.',
  },
  estimado: {
    label: 'Indicador estimado',
    shortLabel: 'Estimado',
    icon: Calculator,
    color: '#8a3a10',
    bg: '#fbe6d8',
    mapShape: 'Contorno punteado y etiqueta ovalada «≈»',
    description: 'Cálculo derivado con método explicado (p. ej. tasa por 10 000 hab. estimados). No es incidencia clínica.',
  },
  ciudadano: {
    label: 'Reporte ciudadano sin verificar',
    shortLabel: 'Reporte ciudadano',
    icon: MessageCircle,
    color: '#1d5aa6',
    bg: '#dde9f8',
    mapShape: 'Círculo azul con conteo agregado',
    description: 'Observación aportada por la ciudadanía. No es un caso clínico confirmado.',
  },
  revisado: {
    label: 'Observación revisada',
    shortLabel: 'Revisada',
    icon: Diamond,
    color: '#4b3cb0',
    bg: '#e7e4f8',
    mapShape: 'Rombo violeta con conteo agregado',
    description: 'Reporte revisado como observación útil. No confirma ningún caso.',
  },
  brigada: {
    label: 'Brigada o campaña',
    shortLabel: 'Brigada',
    icon: Syringe,
    color: '#8f2455',
    bg: '#f8e1ec',
    mapShape: 'Cuadrado magenta con «+»',
    description: 'Actividad preventiva simulada, ubicada por zona aproximada.',
  },
  vector: {
    label: 'Entomológica / vectorial DEMO',
    shortLabel: 'Vectorial DEMO',
    icon: Bug,
    color: '#6a4a00',
    bg: '#f6ebcc',
    mapShape: 'Hexágono ocre con % de ovitrampas positivas',
    description: 'Índice simulado de ovitrampas positivas. Indica presencia de huevos, no transmisión.',
  },
  simulado: {
    label: 'Dato simulado',
    shortLabel: 'Simulado',
    icon: FlaskConical,
    color: '#4a4a48',
    bg: '#ecebe6',
    mapShape: '—',
    description: 'Información ficticia para la demostración.',
  },
};
