/** Validadores de forma para los datos leídos de `localStorage`. */
import type { AuditLog, CitizenReport, MockSession, ReportStatus, SessionRole } from '../types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const SESSION_ROLES: readonly SessionRole[] = ['admin'];
const REPORT_STATUSES: readonly ReportStatus[] = ['pendiente', 'en_revision', 'verificado', 'canalizado', 'cerrado'];

export function isSessionRole(value: unknown): value is SessionRole {
  return typeof value === 'string' && (SESSION_ROLES as readonly string[]).includes(value);
}

export function isMockSession(value: unknown): value is MockSession {
  return (
    isRecord(value) &&
    value.isDemo === true &&
    isSessionRole(value.role) &&
    typeof value.alias === 'string' &&
    typeof value.startedAt === 'string'
  );
}

export function isCitizenReport(value: unknown): value is CitizenReport {
  return (
    isRecord(value) &&
    value.isDemo === true &&
    typeof value.id === 'string' &&
    typeof value.folio === 'string' &&
    typeof value.category === 'string' &&
    typeof value.approximateZone === 'string' &&
    typeof value.comment === 'string' &&
    typeof value.status === 'string' &&
    (REPORT_STATUSES as readonly string[]).includes(value.status) &&
    typeof value.createdAt === 'string' &&
    Array.isArray(value.history)
  );
}

export function isAuditLog(value: unknown): value is AuditLog {
  return (
    isRecord(value) &&
    value.isDemo === true &&
    typeof value.id === 'string' &&
    typeof value.at === 'string' &&
    typeof value.action === 'string' &&
    typeof value.actionCode === 'string' &&
    typeof value.entityType === 'string' &&
    typeof value.entityId === 'string'
  );
}
