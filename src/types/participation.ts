import type { DemoRecord, ISODateTime } from './common';
import type { RegionId } from './epidemiology';

export type ReportCategory = 'posible-criadero' | 'riesgo-ambiental' | 'sintomas-agregados' | 'otro';

export type ReportStatus = 'pendiente' | 'en_revision' | 'verificado' | 'canalizado' | 'cerrado';

export type ReportChannel = 'sitio-movil' | 'codigo-qr' | 'aliado-comunitario';

export type SymptomKey = 'fiebre' | 'tos' | 'diarrea' | 'sarpullido' | 'dolor-articular' | 'otro';

export type PeopleRange = '1-2' | '3-5' | '6+';

/** Síntomas reportados de forma agregada, sin identificar a ninguna persona. */
export interface SymptomSummary {
  symptoms: SymptomKey[];
  peopleRange: PeopleRange;
}

export type ModerationAction =
  | 'envio'
  | 'iniciar-revision'
  | 'aprobar'
  | 'pedir-ampliacion'
  | 'ampliacion-recibida'
  | 'descartar'
  | 'canalizar'
  | 'cerrar';

/** Cambio de estado con fecha y explicación pública (sin datos personales). */
export interface ReportStatusChange {
  status: ReportStatus;
  at: ISODateTime;
  action: ModerationAction;
  note: string;
}

/** Resultado de la revisión de calidad: base de la métrica de utilidad. */
export interface ReportReview {
  complete: boolean;
  pertinent: boolean;
  duplicate: boolean;
}

export type ClosureOutcome =
  | 'atendido-por-autoridad'
  | 'sin-accion-documentada'
  | 'descartado'
  | 'duplicado';

/**
 * Reporte ciudadano. Es una observación, no un caso clínico confirmado.
 * No guarda nombre, teléfono, correo, domicilio ni coordenadas.
 */
export interface CitizenReport extends DemoRecord {
  id: string;
  folio: string;
  category: ReportCategory;
  approximateZone: RegionId;
  comment: string;
  hasSimulatedPhoto: boolean;
  symptoms?: SymptomSummary;
  channel: ReportChannel;
  status: ReportStatus;
  createdAt: ISODateTime;
  history: ReportStatusChange[];
  review?: ReportReview;
  /** Instancia responsable asignada al canalizar (un área, nunca una persona). */
  assignedTo?: string;
  closure?: { at: ISODateTime; outcome: ClosureOutcome; note: string };
  /** Moderación pidió ampliar información; la ciudadanía puede agregarla desde «Mis reportes». */
  awaitingMoreInfo: boolean;
  /** Información adicional aportada tras una solicitud de ampliación. */
  additionalInfo?: string;
  origin: 'propio' | 'ejemplo';
}

/** Observación revisada como útil por moderación. No confirma ningún caso clínico. */
export interface ReviewedObservation extends DemoRecord {
  id: string;
  reportFolio: string;
  regionId: RegionId;
  category: ReportCategory;
  reviewedAt: ISODateTime;
  usefulness: 'util';
  /** Siempre `false`: revisar una observación no confirma casos. */
  confirmsCase: false;
}

/** Decisión de moderación, siempre con motivo registrado. */
export type ModerationDecision =
  | { action: 'iniciar-revision'; reason: string }
  | { action: 'aprobar'; reason: string }
  | { action: 'pedir-ampliacion'; reason: string }
  | { action: 'descartar'; reason: string; discardReason: string }
  | { action: 'canalizar'; reason: string; assignedTo: string }
  | { action: 'cerrar'; reason: string; outcome: 'atendido-por-autoridad' | 'sin-accion-documentada' };

/** Datos que la ciudadanía captura en el formulario. */
export interface NewReportInput {
  category: ReportCategory;
  approximateZone: RegionId;
  comment: string;
  hasSimulatedPhoto: boolean;
  symptoms?: SymptomSummary;
  channel: ReportChannel;
}
