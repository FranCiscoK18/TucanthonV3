import type { DataKind, DemoRecord, ISODate, ISODateTime } from './common';
import type { ModerationDecision, ReportStatus } from './participation';

export type UserRole = 'invitado' | 'ciudadano' | 'institucion' | 'admin';

export type SessionRole = Exclude<UserRole, 'invitado'>;

/** Sesión simulada. No es autenticación real. */
export interface MockSession extends DemoRecord {
  role: SessionRole;
  /** Alias genérico del rol; nunca un nombre real de la persona usuaria. */
  alias: string;
  startedAt: ISODateTime;
}

export type AlertLevel = 'informativo' | 'seguimiento';

/** Aviso informativo con fuente, fecha, criterio y limitación. Nunca usa lenguaje de alarma. */
export interface Alert extends DemoRecord {
  id: string;
  title: string;
  message: string;
  source: string;
  sourceId: string;
  date: ISODate;
  criteria: string;
  limitations: string;
  level: AlertLevel;
  relatedDiseaseId?: string;
}

export type DataSourceStatus = 'activa' | 'pausada' | 'en-revision';

export interface DataSource extends DemoRecord {
  id: string;
  name: string;
  kind: DataKind;
  /** Tipo operativo de la fuente. */
  type: string;
  /** Área responsable (nunca una persona). */
  responsible: string;
  period: string;
  cutoffDate: ISODate;
  updateFrequency: string;
  coverage: string;
  limitations: string;
  status: DataSourceStatus;
  /** Módulo al que pertenece (A: información pública, B: participación y reportes). */
  module: 'A' | 'B';
}

export type AuditEntityType = 'reporte' | 'fuente' | 'sesion' | 'exportacion';

export type AuditActionCode =
  | 'moderacion'
  | 'cambio-fuente'
  | 'inicio-sesion'
  | 'cierre-sesion'
  | 'exportacion-csv'
  | 'carga-escenario';

/** Entrada de bitácora: quién (rol), qué, cuándo y sobre qué entidad. Sin datos personales. */
export interface AuditLog extends DemoRecord {
  id: string;
  at: ISODateTime;
  actorRole: UserRole | 'sistema';
  actorLabel: string;
  actionCode: AuditActionCode;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  detail: string;
  /**
   * Cambio de estado registrado. Permite reconstruir la moderación de los reportes
   * de ejemplo y el estado de las fuentes sin usar claves de almacenamiento adicionales.
   */
  change?:
    | { kind: 'reporte'; from: ReportStatus; to: ReportStatus; decision: ModerationDecision }
    | { kind: 'fuente'; from: DataSourceStatus; to: DataSourceStatus };
}
