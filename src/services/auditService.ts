/**
 * Bitácora (AuditLog) simulada: quién (rol), qué, cuándo y sobre qué entidad.
 * No registra datos personales ni la actividad de la ciudadanía.
 */
import { STORAGE_KEYS } from '../config/demo';
import { getDemoClock } from '../mocks/clock';
import type { AuditEntityType, AuditLog } from '../types';
import { cancunLocalToIso } from '../utils/dates';
import { newId } from '../utils/ids';
import { simulateRequest } from './client';
import { isAuditLog } from './guards';
import { readStoredList, writeStored } from './storage';

const MAX_ENTRIES = 500;

function seedEntry(): AuditLog {
  return {
    id: 'bitacora-escenario',
    at: cancunLocalToIso(getDemoClock().cutoff, '09:00'),
    actorRole: 'sistema',
    actorLabel: 'Sistema Ondara',
    actionCode: 'carga-escenario',
    action: 'Carga inicial de fuentes',
    entityType: 'fuente',
    entityId: 'todas',
    detail: 'Se cargaron las fuentes de datos del periodo.',
    isDemo: true,
  };
}

/** Entradas en orden cronológico (de la más antigua a la más reciente). */
export function readAuditEntries(): AuditLog[] {
  const stored = readStoredList(STORAGE_KEYS.audit, isAuditLog);
  return [seedEntry(), ...stored].sort((a, b) => a.at.localeCompare(b.at));
}

export function appendAudit(input: Omit<AuditLog, 'id' | 'at' | 'isDemo'>): AuditLog {
  const entry: AuditLog = { ...input, id: newId('bitacora'), at: new Date().toISOString(), isDemo: true };
  const stored = readStoredList(STORAGE_KEYS.audit, isAuditLog);
  stored.push(entry);
  writeStored(STORAGE_KEYS.audit, stored.slice(-MAX_ENTRIES));
  return entry;
}

export async function getAuditLog(entityType: AuditEntityType | 'todas' = 'todas'): Promise<AuditLog[]> {
  return simulateRequest(() =>
    readAuditEntries()
      .filter((entry) => entityType === 'todas' || entry.entityType === entityType)
      .reverse(),
  );
}
