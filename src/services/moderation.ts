/**
 * Reglas puras de moderación. Se usan al moderar desde la administración y al
 * reconstruir el estado de los reportes de ejemplo a partir de la bitácora.
 */
import { discardReasons, moderationNote } from '../mocks/reports';
import type { CitizenReport, ClosureOutcome, ModerationDecision, ReportReview, ReportStatus } from '../types';

export type ModerationActionId = ModerationDecision['action'];

export const moderationActionLabels: Record<ModerationActionId, string> = {
  'iniciar-revision': 'Iniciar revisión',
  aprobar: 'Aprobar como observación útil',
  'pedir-ampliacion': 'Pedir ampliación',
  descartar: 'Descartar',
  canalizar: 'Canalizar a instancia responsable',
  cerrar: 'Cerrar seguimiento',
};

export function allowedActions(report: CitizenReport): ModerationActionId[] {
  switch (report.status) {
    case 'pendiente':
      return ['iniciar-revision', 'aprobar', 'pedir-ampliacion', 'descartar'];
    case 'en_revision':
      return report.awaitingMoreInfo ? ['aprobar', 'descartar'] : ['aprobar', 'pedir-ampliacion', 'descartar'];
    case 'verificado':
      return ['canalizar', 'descartar'];
    case 'canalizado':
      return ['cerrar'];
    case 'cerrado':
      return [];
  }
}

export function statusAfter(action: ModerationActionId): ReportStatus {
  switch (action) {
    case 'iniciar-revision':
    case 'pedir-ampliacion':
      return 'en_revision';
    case 'aprobar':
      return 'verificado';
    case 'canalizar':
      return 'canalizado';
    case 'descartar':
    case 'cerrar':
      return 'cerrado';
  }
}

function discardDetails(discardReason: string): { review: ReportReview; outcome: ClosureOutcome } {
  if (discardReason === discardReasons[2]) {
    return { review: { complete: true, pertinent: true, duplicate: true }, outcome: 'duplicado' };
  }
  if (discardReason === discardReasons[0]) {
    return { review: { complete: false, pertinent: true, duplicate: false }, outcome: 'descartado' };
  }
  return { review: { complete: true, pertinent: false, duplicate: false }, outcome: 'descartado' };
}

/** Aplica una decisión y devuelve una copia actualizada del reporte. */
export function applyModeration(report: CitizenReport, decision: ModerationDecision, at: string): CitizenReport {
  const updated = structuredClone(report);
  const status = statusAfter(decision.action);
  let note: string;

  switch (decision.action) {
    case 'iniciar-revision':
      note = moderationNote('iniciar-revision');
      break;
    case 'aprobar':
      updated.review = { complete: true, pertinent: true, duplicate: false };
      updated.awaitingMoreInfo = false;
      note = moderationNote('aprobar');
      break;
    case 'pedir-ampliacion':
      updated.awaitingMoreInfo = true;
      note = moderationNote('pedir-ampliacion', { reason: decision.reason });
      break;
    case 'descartar': {
      const { review, outcome } = discardDetails(decision.discardReason);
      updated.review = review;
      updated.awaitingMoreInfo = false;
      updated.closure = { at, outcome, note: decision.reason };
      note = moderationNote('descartar', { reason: decision.discardReason });
      break;
    }
    case 'canalizar':
      updated.assignedTo = decision.assignedTo;
      note = moderationNote('canalizar', { assignedTo: decision.assignedTo });
      break;
    case 'cerrar':
      updated.closure = { at, outcome: decision.outcome, note: decision.reason };
      note = moderationNote('cerrar', { outcome: decision.outcome, reason: decision.reason });
      break;
  }

  updated.status = status;
  updated.history.push({ status, at, action: decision.action, note });
  return updated;
}

/** ¿El reporte fue revisado como observación útil (aunque luego se haya canalizado o cerrado)? */
export function isUsefulObservation(report: CitizenReport): boolean {
  const approved = report.history.some((change) => change.action === 'aprobar');
  const discarded = report.closure?.outcome === 'descartado' || report.closure?.outcome === 'duplicado';
  return approved && !discarded;
}

/** ¿Ya hubo una decisión de calidad (útil o descartado)? */
export function hasReviewDecision(report: CitizenReport): boolean {
  return report.review !== undefined && report.status !== 'pendiente' && report.status !== 'en_revision';
}
