/**
 * Modelo de datos DEMO de Ondara Cancún.
 *
 * Todos los registros llevan `isDemo: true`. Ninguna entidad contiene datos
 * personales, domicilios ni coordenadas de personas: la unidad mínima
 * geográfica es la zona o microzona (`Region`).
 */

/** Marca obligatoria de todo dato simulado. */
export interface DemoRecord {
  readonly isDemo: true;
}

// ---------------------------------------------------------------------------
// Roles y sesión
// ---------------------------------------------------------------------------

export type UserRole = 'invitado' | 'ciudadano' | 'medico' | 'institucion' | 'admin';

/** Sesión mock. No representa autenticación real. */
export interface MockSession extends DemoRecord {
  role: Exclude<UserRole, 'invitado'>;
  /** Alias genérico, nunca un nombre real. */
  alias: string;
  /** Solo para el rol `medico`: perfil DEMO vinculado. */
  doctorId?: string;
  startedAt: string;
}

// ---------------------------------------------------------------------------
// Geografía
// ---------------------------------------------------------------------------

/** [longitud, latitud] */
export type LngLat = [number, number];

/** Zona amplia de Cancún. Polígono ilustrativo, no límite oficial. */
export interface Region extends DemoRecord {
  id: string;
  name: string;
  description: string;
  /** Centroide de la zona (nunca un domicilio). */
  centroid: LngLat;
  /** Anillo exterior del polígono ilustrativo. */
  polygon: LngLat[];
  /** Población estimada DEMO, usada para indicadores estimados. */
  estimatedPopulation: number;
}

// ---------------------------------------------------------------------------
// Enfermedades y señales
// ---------------------------------------------------------------------------

export type DiseaseCategory =
  | 'viral_respiratoria'
  | 'transmitida_por_vector'
  | 'prevenible_por_vacunacion'
  | 'enterica'
  | 'otra';

export type ReportCategory = 'posible_criadero' | 'riesgo_ambiental' | 'sintomas_agregados' | 'otro';

export interface Disease extends DemoRecord {
  id: string;
  name: string;
  category: DiseaseCategory;
  description: string;
  /** Medidas generales de prevención (texto informativo). */
  prevention: string;
  /** Fuente DEMO asociada (id de `DataSource`). */
  sourceId: string;
  /** Categorías de reporte ciudadano relacionadas (para filtrar el mapa). */
  relatedReportCategories: ReportCategory[];
}

/** Conteo agregado por zona, semana y fuente. Nunca individual. */
export interface AggregatedCase extends DemoRecord {
  regionId: string;
  diseaseId: string;
  /** Semana epidemiológica, formato `2026-S40`. */
  week: string;
  count: number;
  source: 'oficial-demo';
}

/** Registro entomológico/vectorial agregado. */
export interface VectorRecord extends DemoRecord {
  regionId: string;
  week: string;
  /** % de ovitrampas con huevos (índice DEMO). */
  ovitrapPositivity: number;
  trapsInspected: number;
  sourceId: string;
}

/** Criterios transparentes de una señal por incremento inusual. */
export interface SignalCriteria {
  windowWeeks: number;
  baselineWeeks: number;
  /** Razón mínima entre ventana y línea base. */
  ratioThreshold: number;
  minObservations: number;
}

export interface SignalResult {
  diseaseId: string;
  regionId: string | 'todas';
  windowTotal: number;
  baselineMean: number;
  ratio: number | null;
  meetsMinimum: boolean;
  triggered: boolean;
  criteria: SignalCriteria;
}

export type AlertLevel = 'informativa' | 'seguimiento';

/** Aviso informativo. Nunca es una alerta sanitaria oficial. */
export interface Alert extends DemoRecord {
  id: string;
  title: string;
  summary: string;
  level: AlertLevel;
  source: string;
  date: string;
  criteria: string;
  limitations: string;
  regionId?: string;
  diseaseId?: string;
}

// ---------------------------------------------------------------------------
// Brigadas y campañas
// ---------------------------------------------------------------------------

export type TargetPopulation = 'general' | 'infancia' | 'personas_mayores' | 'embarazo' | 'personal_escolar';
export type ScheduleBlock = 'manana' | 'tarde';
export type ActivityStatus = 'programada' | 'en_curso' | 'finalizada' | 'reprogramada';

export interface VaccinationBrigade extends DemoRecord {
  id: string;
  title: string;
  diseaseIds: string[];
  regionId: string;
  /** Referencia pública aproximada (p. ej. "explanada pública de la zona"). */
  approximatePlace: string;
  date: string;
  startTime: string;
  endTime: string;
  schedule: ScheduleBlock;
  targetPopulation: TargetPopulation[];
  requirements: string[];
  status: ActivityStatus;
  sourceId: string;
}

export interface Campaign extends DemoRecord {
  id: string;
  title: string;
  description: string;
  diseaseIds: string[];
  regionIds: string[];
  startDate: string;
  endDate: string;
  targetPopulation: TargetPopulation[];
  status: ActivityStatus;
  sourceId: string;
}

// ---------------------------------------------------------------------------
// Directorio y citas
// ---------------------------------------------------------------------------

export type Modality = 'presencial' | 'en_linea';
export type ProviderType = 'medico' | 'consultorio' | 'clinica';

export interface DoctorSchedule extends DemoRecord {
  doctorId: string;
  /** 0 = domingo … 6 = sábado */
  weekday: number;
  start: string;
  end: string;
  slotMinutes: number;
  modality: Modality;
}

export interface Doctor extends DemoRecord {
  id: string;
  name: string;
  providerType: ProviderType;
  specialty: string;
  healthProblems: string[];
  /** Credencial simulada, nunca una cédula real. */
  credential: string;
  priceMxn: number;
  modalities: Modality[];
  regionId: string;
  bio: string;
  languages: string[];
}

export type AppointmentStatus = 'confirmada' | 'cancelada';

export interface Appointment extends DemoRecord {
  id: string;
  folio: string;
  doctorId: string;
  modality: Modality;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  time: string;
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Reportes ciudadanos
// ---------------------------------------------------------------------------

export type ReportStatus = 'pendiente' | 'en_revision' | 'verificado' | 'canalizado' | 'cerrado';
export type ReportChannel = 'sitio_movil' | 'codigo_qr' | 'aliado_comunitario';

export interface ReportStatusChange {
  status: ReportStatus;
  at: string;
  note: string;
}

/** Observación ciudadana. No es un caso clínico confirmado. */
export interface CitizenReport extends DemoRecord {
  id: string;
  folio: string;
  category: ReportCategory;
  /** Id de `Region`. Zona aproximada, nunca una dirección. */
  approximateZone: string;
  comments: string;
  /** Solo el nombre del archivo simulado; la imagen no se guarda. */
  simulatedPhotoName?: string;
  channel: ReportChannel;
  status: ReportStatus;
  createdAt: string;
  history: ReportStatusChange[];
  /** true si fue creado en este navegador (localStorage). */
  isOwn?: boolean;
}

/** Observación revisada como útil. No confirma ningún caso. */
export interface ReviewedObservation extends DemoRecord {
  id: string;
  reportId: string;
  regionId: string;
  category: ReportCategory;
  reviewedAt: string;
  usefulness: 'util' | 'util_con_ampliacion';
  channeledTo?: string;
}

// ---------------------------------------------------------------------------
// Fuentes, bitácora y panel institucional
// ---------------------------------------------------------------------------

export type DataSourceType = 'oficial-demo' | 'estimado' | 'ciudadano' | 'entomologico-demo' | 'campanas-demo' | 'directorio-demo';
export type DataSourceStatus = 'activa' | 'pausada' | 'en_validacion';

export interface DataSource extends DemoRecord {
  id: string;
  name: string;
  type: DataSourceType;
  /** Área responsable (cargo genérico, nunca persona). */
  responsible: string;
  period: string;
  cutoffDate: string;
  coverage: string;
  status: DataSourceStatus;
  limitations: string;
}

export type AuditAction =
  | 'reporte_aprobado'
  | 'reporte_ampliacion'
  | 'reporte_descartado'
  | 'reporte_canalizado'
  | 'reporte_cerrado'
  | 'fuente_actualizada'
  | 'exportacion_csv'
  | 'configuracion_modo_prueba';

export interface AuditLog extends DemoRecord {
  id: string;
  /** Rol que ejecutó la acción (sin identidad personal). */
  actorRole: UserRole;
  action: AuditAction;
  entityType: 'reporte' | 'fuente' | 'exportacion' | 'configuracion';
  entityId: string;
  reason: string;
  at: string;
}

export type IndicatorDimension = 'utilidad' | 'oportunidad' | 'seguimiento' | 'cobertura' | 'sostenibilidad';

export interface Indicator extends DemoRecord {
  id: string;
  dimension: IndicatorDimension;
  name: string;
  value: number;
  unit: string;
  target?: string;
  definition: string;
  /** Nota de interpretación (sesgos, límites). */
  note: string;
  trend: number[];
}

export type PilotStageStatus = 'completada' | 'en_curso' | 'pendiente';

export interface PilotStage extends DemoRecord {
  id: string;
  name: 'Preparación' | 'Despliegue' | 'Operación' | 'Cierre';
  days: string;
  status: PilotStageStatus;
  activities: string[];
  deliverable: string;
}

export interface PilotQuestion extends DemoRecord {
  id: string;
  question: string;
  dimension: IndicatorDimension;
  evidence: string;
}

export interface PriorityZone extends DemoRecord {
  regionId: string;
  score: number;
  reasons: string[];
}

export interface RegulationItem extends DemoRecord {
  id: string;
  name: string;
  scope: string;
  relevance: string;
  pendingReview: string;
}

/** Filtros de periodo comunes (en semanas). */
export type PeriodWeeks = 4 | 8 | 12;
