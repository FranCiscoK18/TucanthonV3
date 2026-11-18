/**
 * Reportes ciudadanos simulados. Los reportes propios se guardan solo en este
 * navegador; los de ejemplo se reconstruyen aplicando la bitácora de moderación.
 * Un reporte ciudadano es una observación, no un caso clínico confirmado.
 */
import { REPORT_COMMENT_MAX, STORAGE_KEYS } from '../config/demo';
import { getDemoClock } from '../mocks/clock';
import { discardReasons, getSeedReports, moderationNote, responsibleOptions } from '../mocks/reports';
import { regionById } from '../mocks/regions';
import type {
  CitizenReport,
  ModerationDecision,
  NewReportInput,
  RegionId,
  ReportCategory,
  ReportChannel,
  ReportStatus,
  ReviewedObservation,
  SessionRole,
} from '../types';
import { newId, newReportFolio } from '../utils/ids';
import { detectPersonalData } from '../utils/privacy';
import { appendAudit, readAuditEntries } from './auditService';
import { NotFoundError, ValidationError, simulateRequest } from './client';
import { isCitizenReport } from './guards';
import {
  allowedActions,
  applyModeration,
  isUsefulObservation,
  moderationActionLabels,
  statusAfter,
} from './moderation';
import { readStoredList, writeStored } from './storage';

const CATEGORIES: readonly ReportCategory[] = ['posible-criadero', 'riesgo-ambiental', 'sintomas-agregados', 'otro'];
const CHANNELS: readonly ReportChannel[] = ['sitio-movil', 'codigo-qr', 'aliado-comunitario'];

function readOwnReports(): CitizenReport[] {
  return readStoredList(STORAGE_KEYS.reports, isCitizenReport);
}

function writeOwnReports(reports: CitizenReport[]): void {
  if (!writeStored(STORAGE_KEYS.reports, reports)) {
    throw new Error('No se pudo guardar en este navegador (almacenamiento local no disponible).');
  }
}

/** Reportes de ejemplo con la moderación registrada en bitácora ya aplicada. */
function seedReportsWithModeration(): CitizenReport[] {
  const byFolio = new Map(getSeedReports().map((report) => [report.folio, report]));
  for (const entry of readAuditEntries()) {
    if (entry.change?.kind !== 'reporte') continue;
    const report = byFolio.get(entry.entityId);
    if (!report || report.status !== entry.change.from) continue;
    byFolio.set(entry.entityId, applyModeration(report, entry.change.decision, entry.at));
  }
  return [...byFolio.values()];
}

/** Todos los reportes (ejemplo + propios), sin latencia: base de agregados e indicadores. */
export function getAllReportsSnapshot(): CitizenReport[] {
  return [...seedReportsWithModeration(), ...readOwnReports()];
}

/** Observaciones revisadas como útiles. Ninguna confirma un caso. */
export function deriveReviewedObservations(reports: readonly CitizenReport[]): ReviewedObservation[] {
  return reports.filter(isUsefulObservation).map((report) => ({
    id: `observacion-${report.folio}`,
    reportFolio: report.folio,
    regionId: report.approximateZone,
    category: report.category,
    reviewedAt: report.history.find((change) => change.action === 'aprobar')?.at ?? report.createdAt,
    usefulness: 'util' as const,
    confirmsCase: false as const,
    isDemo: true as const,
  }));
}

function validateFreeText(text: string, field: string, errors: Record<string, string>, required: boolean): void {
  const trimmed = text.trim();
  if (required && trimmed.length < 5) {
    errors[field] = 'Escribe al menos 5 caracteres.';
    return;
  }
  if (trimmed.length > REPORT_COMMENT_MAX) {
    errors[field] = `Usa como máximo ${REPORT_COMMENT_MAX} caracteres.`;
    return;
  }
  const issues = detectPersonalData(trimmed);
  if (issues.length > 0) errors[field] = issues.map((issue) => issue.message).join(' ');
}

export function validateReportInput(input: NewReportInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!CATEGORIES.includes(input.category)) errors.category = 'Elige una categoría.';
  if (!regionById.has(input.approximateZone)) errors.approximateZone = 'Elige la zona aproximada.';
  if (!CHANNELS.includes(input.channel)) errors.channel = 'Canal no válido.';
  validateFreeText(input.comment, 'comment', errors, input.category === 'otro');
  if (input.category === 'sintomas-agregados') {
    if (!input.symptoms || input.symptoms.symptoms.length === 0) errors.symptoms = 'Marca al menos un síntoma observado.';
    if (!input.symptoms?.peopleRange) errors.peopleRange = 'Indica cuántas personas, de forma aproximada.';
  }
  return errors;
}

export async function submitReport(input: NewReportInput): Promise<CitizenReport> {
  return simulateRequest(() => {
    const errors = validateReportInput(input);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);
    const now = new Date();
    const createdAt = now.toISOString();
    const report: CitizenReport = {
      id: newId('reporte'),
      folio: newReportFolio(now),
      category: input.category,
      approximateZone: input.approximateZone,
      comment: input.comment.trim(),
      hasSimulatedPhoto: input.hasSimulatedPhoto && input.category !== 'sintomas-agregados',
      ...(input.category === 'sintomas-agregados' && input.symptoms ? { symptoms: input.symptoms } : {}),
      channel: input.channel,
      status: 'pendiente',
      createdAt,
      history: [{ status: 'pendiente', at: createdAt, action: 'envio', note: moderationNote('envio') }],
      awaitingMoreInfo: false,
      origin: 'propio',
      isDemo: true,
    };
    writeOwnReports([...readOwnReports(), report]);
    return report;
  });
}

export async function listMyReports(): Promise<CitizenReport[]> {
  return simulateRequest(() => readOwnReports().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function addMoreInfo(reportId: string, text: string): Promise<CitizenReport> {
  return simulateRequest(() => {
    const errors: Record<string, string> = {};
    validateFreeText(text, 'additionalInfo', errors, true);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);
    const reports = readOwnReports();
    const index = reports.findIndex((report) => report.id === reportId);
    const report = reports[index];
    if (!report) throw new NotFoundError('No encontramos ese reporte en este navegador.');
    if (!report.awaitingMoreInfo) throw new Error('Este reporte no tiene una solicitud de ampliación pendiente.');
    const at = new Date().toISOString();
    const updated: CitizenReport = {
      ...report,
      additionalInfo: text.trim(),
      awaitingMoreInfo: false,
      status: 'en_revision',
      history: [...report.history, { status: 'en_revision', at, action: 'ampliacion-recibida', note: moderationNote('ampliacion-recibida') }],
    };
    reports[index] = updated;
    writeOwnReports(reports);
    return updated;
  });
}

export async function deleteMyReport(reportId: string): Promise<void> {
  return simulateRequest(() => {
    writeOwnReports(readOwnReports().filter((report) => report.id !== reportId));
  });
}

export interface ModerationFilters {
  status: ReportStatus | 'activos' | 'todos';
  regionId: RegionId | 'todas';
  category: ReportCategory | 'todas';
  /** Búsqueda parcial por folio (sin distinguir mayúsculas). */
  folio?: string;
}

const ACTIVE: readonly ReportStatus[] = ['pendiente', 'en_revision', 'verificado', 'canalizado'];
/** Orden de la cola: lo que requiere atención primero. */
const STATUS_PRIORITY: readonly ReportStatus[] = ['pendiente', 'en_revision', 'verificado', 'canalizado', 'cerrado'];

export async function getModerationQueue(filters: ModerationFilters): Promise<CitizenReport[]> {
  return simulateRequest(() =>
    getAllReportsSnapshot()
      .filter((report) =>
        filters.status === 'todos'
          ? true
          : filters.status === 'activos'
            ? ACTIVE.includes(report.status)
            : report.status === filters.status,
      )
      .filter((report) => filters.regionId === 'todas' || report.approximateZone === filters.regionId)
      .filter((report) => filters.category === 'todas' || report.category === filters.category)
      .filter((report) => !filters.folio?.trim() || report.folio.toLowerCase().includes(filters.folio.trim().toLowerCase()))
      .sort(
        (a, b) =>
          STATUS_PRIORITY.indexOf(a.status) - STATUS_PRIORITY.indexOf(b.status) || a.createdAt.localeCompare(b.createdAt),
      ),
  );
}

function validateDecision(decision: ModerationDecision): Record<string, string> {
  const errors: Record<string, string> = {};
  const reason = decision.reason.trim();
  if (reason.length < 5) errors.reason = 'Registra el motivo (al menos 5 caracteres).';
  else if (reason.length > REPORT_COMMENT_MAX) errors.reason = `Usa como máximo ${REPORT_COMMENT_MAX} caracteres.`;
  else if (detectPersonalData(reason).length > 0) errors.reason = 'El motivo no debe contener datos personales.';
  if (decision.action === 'descartar' && !(discardReasons as readonly string[]).includes(decision.discardReason)) {
    errors.discardReason = 'Elige el motivo de descarte.';
  }
  if (decision.action === 'canalizar' && !responsibleOptions.includes(decision.assignedTo)) {
    errors.assignedTo = 'Elige la instancia responsable.';
  }
  return errors;
}

export async function moderateReport(
  reportId: string,
  decision: ModerationDecision,
  actor: { role: SessionRole; label: string },
): Promise<CitizenReport> {
  return simulateRequest(() => {
    const errors = validateDecision(decision);
    if (Object.keys(errors).length > 0) throw new ValidationError(errors);
    const all = getAllReportsSnapshot();
    const report = all.find((item) => item.id === reportId);
    if (!report) throw new NotFoundError('El reporte ya no está disponible.');
    if (!allowedActions(report).includes(decision.action)) {
      throw new Error('Esa acción no está disponible para el estado actual del reporte.');
    }
    const at = new Date().toISOString();
    const trimmed = { ...decision, reason: decision.reason.trim() };
    const updated = applyModeration(report, trimmed, at);

    if (report.origin === 'propio') {
      writeOwnReports(readOwnReports().map((item) => (item.id === report.id ? updated : item)));
    }
    appendAudit({
      actorRole: actor.role,
      actorLabel: actor.label,
      actionCode: 'moderacion',
      action: `Moderación · ${moderationActionLabels[trimmed.action]}`,
      entityType: 'reporte',
      entityId: report.folio,
      detail: trimmed.reason,
      change: { kind: 'reporte', from: report.status, to: statusAfter(trimmed.action), decision: trimmed },
    });
    return updated;
  });
}

/** Fecha de actualización de la capa ciudadana (ahora) y de corte oficial. */
export function participationTimestamps(): { updatedAt: string; officialCutoff: string } {
  return { updatedAt: new Date().toISOString(), officialCutoff: getDemoClock().cutoff };
}
