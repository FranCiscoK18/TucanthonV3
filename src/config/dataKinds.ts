/**
 * Sistema visual de tipos de dato: cada tipo combina color, icono y
 * etiqueta textual, para que nunca dependa solo del color.
 */
import { FlaskConical, Landmark, MessageSquareText, Sigma, type LucideIcon } from 'lucide-react';
import type { DataKind } from '../types';

export interface DataKindMeta {
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
  badgeClass: string;
}

export const DATA_KIND_META: Record<DataKind, DataKindMeta> = {
  'oficial-demo': {
    label: 'Serie epidemiológica ilustrativa',
    short: 'Ilustrativo',
    description: 'Serie ilustrativa agregada por zona; no procede de registros oficiales.',
    icon: Landmark,
    badgeClass: 'bg-oficial-50 text-oficial-700 border border-oficial-500/40',
  },
  estimado: {
    label: 'Indicador estimado',
    short: 'Estimado',
    description: 'Calculado a partir de otros datos con un método explicado.',
    icon: Sigma,
    badgeClass: 'bg-estimado-50 text-estimado-700 border border-dashed border-estimado-500/70',
  },
  'reporte-ciudadano': {
    label: 'Reporte ciudadano',
    short: 'Ciudadano',
    description: 'Observación enviada por la ciudadanía. No es un caso clínico confirmado.',
    icon: MessageSquareText,
    badgeClass: 'bg-ciudadano-50 text-ciudadano-700 border border-ciudadano-500/40',
  },
  simulado: {
    label: 'Escenario ilustrativo',
    short: 'Ejemplo',
    description: 'Actividad o escenario de referencia, no una convocatoria real.',
    icon: FlaskConical,
    badgeClass: 'bg-simulado-50 text-simulado-700 border border-dashed border-simulado-500/70',
  },
};
