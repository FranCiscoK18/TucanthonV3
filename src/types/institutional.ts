import type { DemoRecord } from './common';
import type { RegionId } from './epidemiology';
import type { ReportCategory, ReportChannel, ReportStatus } from './participation';

export type IndicatorDimension = 'utilidad' | 'oportunidad' | 'seguimiento' | 'cobertura' | 'sostenibilidad';

export type IndicatorUnit = '%' | 'horas' | 'MXN' | 'reportes' | 'por 100 mil hab.';

/** Métrica primaria del piloto. Nunca se presenta como causalidad clínica. */
export interface Indicator extends DemoRecord {
  id: string;
  dimension: IndicatorDimension;
  name: string;
  definition: string;
  formula: string;
  value: number | null;
  unit: IndicatorUnit;
  numerator?: number;
  denominator?: number;
  /** Meta DEMO de referencia para el piloto. */
  target?: number;
  targetDirection?: 'mayor-o-igual' | 'menor-o-igual';
  caveat: string;
}

export interface CoverageRow {
  regionId: RegionId;
  reports: number;
  ratePer100k: number;
}

export interface ChannelRow {
  channel: ReportChannel;
  reports: number;
  share: number;
}

export interface InstitutionalSummary {
  periodLabel: string;
  regionLabel: string;
  totalReports: number;
  reviewedReports: number;
  indicators: Indicator[];
  coverageByZone: CoverageRow[];
  coverageByChannel: ChannelRow[];
  weeklyCostMXN: number;
}

export interface PriorityZone {
  regionId: RegionId;
  score: number;
  officialSignal: boolean;
  officialRatio: number | null;
  vectorPositivityPct: number | null;
  vectorAboveThreshold: boolean;
  unverifiedReports: number;
  reasons: string[];
}

/** Fila de la tabla de reportes agregados: no contiene textos libres ni identificadores. */
export interface AggregatedReportRow {
  regionId: RegionId;
  weekId: string;
  weekLabel: string;
  category: ReportCategory;
  status: ReportStatus;
  count: number;
}

export type PilotStageId = 'preparacion' | 'despliegue' | 'operacion' | 'cierre';

export interface PilotStage extends DemoRecord {
  id: PilotStageId;
  name: string;
  startDay: number;
  endDay: number;
  objective: string;
  activities: string[];
  deliverables: string[];
  status: 'completada' | 'en-curso' | 'pendiente';
}

/** Pregunta de decisión del piloto. */
export interface PilotQuestion extends DemoRecord {
  id: string;
  dimension: IndicatorDimension;
  question: string;
  evidence: string;
}

export interface PilotOverview {
  currentDay: number;
  totalDays: number;
  stages: PilotStage[];
  questions: PilotQuestion[];
}
