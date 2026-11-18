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
    label: 'Registro epidemiológico',
    short: 'Registro',
    description: 'Registros semanales agregados por zona.',
    icon: Landmark,
    badgeClass: 'bg-oficial-50 text-oficial-700 border border-oficial-500/40',
  },
  estimado: {
    label: 'Tasa por población',
    short: 'Tasa',
    description: 'Registros por cada 10 mil habitantes, para comparar zonas de distinto tamaño.',
    icon: Sigma,
    badgeClass: 'bg-estimado-50 text-estimado-700 border border-dashed border-estimado-500/70',
  },
  'reporte-ciudadano': {
    label: 'Reporte ciudadano',
    short: 'Ciudadano',
    description: 'Observación ciudadana; no equivale a un caso clínico confirmado.',
    icon: MessageSquareText,
    badgeClass: 'bg-ciudadano-50 text-ciudadano-700 border border-ciudadano-500/40',
  },
  simulado: {
    label: 'Agenda de actividades',
    short: 'Agenda',
    description: 'Brigadas y campañas programadas por la autoridad sanitaria.',
    icon: FlaskConical,
    badgeClass: 'bg-simulado-50 text-simulado-700 border border-dashed border-simulado-500/70',
  },
};
