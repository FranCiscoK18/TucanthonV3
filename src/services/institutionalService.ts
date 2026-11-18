import { indicators, pilotQuestions, pilotStages, priorityZones } from '../mocks/institutional';
import { dataSources } from '../mocks/sources';
import type { DataSource, DataSourceStatus, Indicator, PilotQuestion, PilotStage, PriorityZone, UserRole } from '../types';
import { DEMO_CUTOFF_DATE } from '../utils/dates';
import { recordAudit } from './auditService';
import { simulate } from './client';

export interface InstitutionalOverview {
  indicators: Indicator[];
  priorityZones: PriorityZone[];
  pilotStages: PilotStage[];
  pilotQuestions: PilotQuestion[];
  cutoffDate: string;
}

export function getInstitutionalOverview(): Promise<InstitutionalOverview> {
  return simulate(() => ({ indicators, priorityZones, pilotStages, pilotQuestions, cutoffDate: DEMO_CUTOFF_DATE }));
}

/** Copia en memoria editable por administración (se reinicia al recargar). */
const sources: DataSource[] = structuredClone(dataSources);

export function getDataSources(): Promise<DataSource[]> {
  return simulate(() => sources);
}

export function updateDataSource(
  id: string,
  patch: { status?: DataSourceStatus; cutoffDate?: string },
  reason: string,
  actorRole: UserRole,
): Promise<DataSource> {
  return simulate(() => {
    const source = sources.find((s) => s.id === id);
    if (!source) throw new Error('Fuente no encontrada.');
    if (reason.trim().length < 5) throw new Error('Registra un motivo de al menos 5 caracteres.');
    Object.assign(source, patch);
    recordAudit({ actorRole, action: 'fuente_actualizada', entityType: 'fuente', entityId: id, reason: reason.trim() });
    return source;
  });
}
