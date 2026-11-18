/**
 * Gestión simulada de fuentes de datos. El estado de cada fuente se reconstruye a
 * partir de la bitácora, sin claves de almacenamiento adicionales.
 */
import { getDataSourcesMock } from '../mocks/sources';
import type { DataSource, DataSourceStatus, SessionRole } from '../types';
import { detectPersonalData } from '../utils/privacy';
import { appendAudit, readAuditEntries } from './auditService';
import { NotFoundError, ValidationError, simulateRequest } from './client';

export const sourceStatusLabels: Record<DataSourceStatus, string> = {
  activa: 'Activa',
  pausada: 'Pausada',
  'en-revision': 'En revisión',
};

function sourcesWithAudit(): DataSource[] {
  const byId = new Map(getDataSourcesMock().map((source) => [source.id, source]));
  for (const entry of readAuditEntries()) {
    if (entry.change?.kind !== 'fuente') continue;
    const source = byId.get(entry.entityId);
    if (source) byId.set(source.id, { ...source, status: entry.change.to });
  }
  return [...byId.values()];
}

export function getDataSourcesSnapshot(): DataSource[] {
  return sourcesWithAudit();
}

export async function getDataSources(): Promise<DataSource[]> {
  return simulateRequest(sourcesWithAudit);
}

export async function setDataSourceStatus(
  id: string,
  status: DataSourceStatus,
  reason: string,
  actor: { role: SessionRole; label: string },
): Promise<DataSource> {
  return simulateRequest(() => {
    const trimmed = reason.trim();
    if (trimmed.length < 5) throw new ValidationError({ reason: 'Registra el motivo (al menos 5 caracteres).' });
    if (detectPersonalData(trimmed).length > 0) throw new ValidationError({ reason: 'El motivo no debe contener datos personales.' });
    const source = sourcesWithAudit().find((item) => item.id === id);
    if (!source) throw new NotFoundError('Fuente no encontrada.');
    if (source.status === status) return source;
    appendAudit({
      actorRole: actor.role,
      actorLabel: actor.label,
      actionCode: 'cambio-fuente',
      action: `Fuente: ${sourceStatusLabels[source.status]} → ${sourceStatusLabels[status]}`,
      entityType: 'fuente',
      entityId: source.id,
      detail: trimmed,
      change: { kind: 'fuente', from: source.status, to: status },
    });
    return { ...source, status };
  });
}
