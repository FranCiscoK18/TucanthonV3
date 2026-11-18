import type { DemoRecord, ISODate, LngLat } from './common';

export type DiseaseCategory =
  | 'viral-respiratoria'
  | 'transmitida-por-vector'
  | 'prevenible-por-vacunacion'
  | 'enterica'
  | 'otra';

/** Enfermedad o señal (síndrome o indicador no específico) monitoreada en la DEMO. */
export interface Disease extends DemoRecord {
  id: string;
  name: string;
  shortName: string;
  kind: 'enfermedad' | 'senal';
  category: DiseaseCategory;
  /** Resumen de una línea para tarjetas. */
  summary: string;
  /** Descripción general, informativa y no diagnóstica. */
  description: string;
  /** Cómo se representa su vigilancia en esta DEMO. */
  monitoring: string;
  /** Medidas generales de prevención; no sustituyen indicaciones médicas. */
  prevention: string;
  sourceId: string;
  hasVectorData: boolean;
}

export type RegionId = string;

/** Zona amplia de Cancún. Nunca representa domicilios ni ubicaciones individuales. */
export interface Region extends DemoRecord {
  id: RegionId;
  name: string;
  shortName: string;
  description: string;
  /** Población estimada DEMO (no censal), usada solo para tasas ilustrativas. */
  populationEstimate: number;
  /** Polígono simplificado e ilustrativo; no es un límite oficial. Anillo cerrado. */
  polygon: ReadonlyArray<LngLat>;
  /** Punto de anclaje para las fichas agregadas de la zona. */
  anchor: LngLat;
  /** Punto aproximado (espacio público genérico) donde se ubican brigadas y campañas de la zona. */
  activityAnchor: LngLat;
}

/** Conteo semanal agregado por zona, simulando un registro oficial. */
export interface AggregatedCase extends DemoRecord {
  id: string;
  diseaseId: string;
  regionId: RegionId;
  weekId: string;
  weekStart: ISODate;
  /** Registros notificados agregados (DEMO). */
  count: number;
  source: 'oficial-demo';
  sourceId: string;
}

/** Vigilancia entomológica agregada por zona y semana (ovitrampas simuladas). */
export interface VectorRecord extends DemoRecord {
  id: string;
  regionId: RegionId;
  weekId: string;
  weekStart: ISODate;
  trapsInspected: number;
  trapsPositive: number;
  /** Porcentaje de ovitrampas con huevos de mosquito. */
  positivityPct: number;
  /** Promedio de huevos por ovitrampa positiva. */
  meanEggs: number;
  source: 'entomologico-demo';
  sourceId: string;
}

/** Criterios transparentes para marcar una señal por incremento inusual. */
export interface SignalCriteria {
  /** Semanas más recientes que se comparan. */
  windowWeeks: number;
  /** Semanas previas a la ventana que forman la línea base. */
  baselineWeeks: number;
  /** Razón mínima ventana / línea base esperada para la misma duración. */
  thresholdRatio: number;
  /** Registros mínimos en la ventana para evaluar. */
  minObservations: number;
}

export type SignalStatus = 'senal' | 'sin-senal' | 'insuficiente';

export interface SignalEvaluation {
  diseaseId: string;
  /** `ciudad` para el total de Cancún o el id de una zona. */
  scope: RegionId | 'ciudad';
  windowTotal: number;
  /** Total esperado en la ventana según la línea base. */
  expected: number;
  baselineWeeklyMean: number;
  ratio: number | null;
  status: SignalStatus;
  criteria: SignalCriteria;
  windowLabel: string;
  baselineLabel: string;
}

/** Punto de una serie semanal para gráficas y tablas. */
export interface WeeklyPoint {
  weekId: string;
  label: string;
  start: ISODate;
  end: ISODate;
  value: number;
}
