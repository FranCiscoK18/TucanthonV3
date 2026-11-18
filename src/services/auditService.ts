import { STORAGE_KEYS } from '../config/demo';
import type { AuditAction, AuditLog, UserRole } from '../types';
import { makeId } from '../utils/format';
import { simulate } from './client';
import { readJson, writeJson } from './storage';

/** Entradas iniciales de ejemplo (en memoria). */
const seedAudit: AuditLog[] = [
  {
    id: 'aud-seed-1',
    actorRole: 'admin',
    action: 'fuente_actualizada',
    entityType: 'fuente',
    entityId: 'src-vector',
    reason: 'Fuente marcada "en validación" hasta revisar cobertura del muestreo.',
    at: '2026-11-14T16:20:00.000Z',
    isDemo: true,
  },
  {
    id: 'aud-seed-2',
    actorRole: 'institucion',
    action: 'exportacion_csv',
    entityType: 'exportacion',
    entityId: 'agregados-12-semanas',
    reason: 'Exportación de agregados por zona para reunión semanal (sin datos personales).',
    at: '2026-11-13T18:05:00.000Z',
    isDemo: true,
  },
];

export function recordAudit(entry: { actorRole: UserRole; action: AuditAction; entityType: AuditLog['entityType']; entityId: string; reason: string }): AuditLog {
  const log: AuditLog = { ...entry, id: makeId('aud'), at: new Date().toISOString(), isDemo: true };
  const stored = readJson<AuditLog[]>(STORAGE_KEYS.auditLog, []);
  writeJson(STORAGE_KEYS.auditLog, [log, ...stored].slice(0, 200));
  return log;
}

export function getAuditLog(): Promise<AuditLog[]> {
  return simulate(() =>
    [...readJson<AuditLog[]>(STORAGE_KEYS.auditLog, []), ...seedAudit].sort((a, b) => b.at.localeCompare(a.at)),
  );
}

export const auditActionLabels: Record<AuditAction, string> = {
  reporte_aprobado: 'Reporte aprobado como observación útil',
  reporte_ampliacion: 'Se pidió ampliación del reporte',
  reporte_descartado: 'Reporte descartado',
  reporte_canalizado: 'Reporte canalizado',
  reporte_cerrado: 'Reporte cerrado',
  fuente_actualizada: 'Fuente actualizada',
  exportacion_csv: 'Exportación CSV de agregados',
  configuracion_modo_prueba: 'Cambio de modo prueba',
};
