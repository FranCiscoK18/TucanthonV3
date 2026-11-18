import { STORAGE_KEYS } from '../config/demo';
import { regionById } from '../mocks/regions';
import { seedReports } from '../mocks/reports';
import type { CitizenReport, PeriodWeeks, ReportCategory, ReportChannel, ReportStatus, UserRole } from '../types';
import { lastWeeks } from '../utils/dates';
import { makeFolio, makeId } from '../utils/format';
import { recordAudit } from './auditService';
import { simulate } from './client';
import { readJson, writeJson } from './storage';
import { weekOf } from './weeks';

/** Copia en memoria de los reportes DEMO de terceros (la moderación la modifica). */
const thirdPartyReports: CitizenReport[] = structuredClone(seedReports);

function readOwn(): CitizenReport[] {
  return readJson<CitizenReport[]>(STORAGE_KEYS.reports, []);
}

function writeOwn(reports: CitizenReport[]): void {
  writeJson(STORAGE_KEYS.reports, reports);
}

/** Todos los reportes (terceros DEMO + propios). Uso interno de servicios. */
export function getAllReportsSync(): CitizenReport[] {
  return [...readOwn(), ...thirdPartyReports];
}

export interface NewReportInput {
  category: ReportCategory;
  approximateZone: string;
  comments: string;
  simulatedPhotoName?: string;
  channel: ReportChannel;
}

export interface ReportValidationErrors {
  category?: string;
  approximateZone?: string;
  comments?: string;
}

const PERSONAL_DATA_PATTERNS: Array<{ re: RegExp; message: string }> = [
  { re: /[\w.+-]+@[\w-]+\.[\w.]+/, message: 'Parece incluir un correo electrónico. Quítalo: no pedimos datos personales.' },
  { re: /(\+?\d[\d\s-]{7,}\d)/, message: 'Parece incluir un número telefónico. Quítalo: no pedimos datos personales.' },
  {
    re: /\b(calle|av\.?|avenida|mz\.?|manzana|lote|lt\.?|n[uú]m(ero)?\.?|#\s?\d)/i,
    message: 'Parece incluir una dirección. Describe solo la zona general, sin calle ni número.',
  },
];

export function validateReport(input: Partial<NewReportInput>): ReportValidationErrors {
  const errors: ReportValidationErrors = {};
  if (!input.category) errors.category = 'Elige una categoría.';
  if (!input.approximateZone || !regionById(input.approximateZone)) errors.approximateZone = 'Elige la zona aproximada.';
  const comments = input.comments?.trim() ?? '';
  if (comments.length < 10) errors.comments = 'Describe la observación en al menos 10 caracteres.';
  else if (comments.length > 400) errors.comments = 'Máximo 400 caracteres.';
  else {
    const hit = PERSONAL_DATA_PATTERNS.find((p) => p.re.test(comments));
    if (hit) errors.comments = hit.message;
  }
  return errors;
}

export function createReport(input: NewReportInput): Promise<CitizenReport> {
  return simulate(() => {
    const errors = validateReport(input);
    if (Object.keys(errors).length) throw new Error('El reporte tiene campos inválidos.');
    const now = new Date().toISOString();
    const report: CitizenReport = {
      id: makeId('rep'),
      folio: makeFolio('REP'),
      category: input.category,
      approximateZone: input.approximateZone,
      comments: input.comments.trim(),
      simulatedPhotoName: input.simulatedPhotoName,
      channel: input.channel,
      status: 'pendiente',
      createdAt: now,
      history: [{ status: 'pendiente', at: now, note: 'Reporte recibido. Aún no se revisa.' }],
      isOwn: true,
      isDemo: true,
    };
    writeOwn([report, ...readOwn()]);
    return report;
  });
}

export function getOwnReports(): Promise<CitizenReport[]> {
  return simulate(() => readOwn().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export function deleteOwnReport(id: string): Promise<void> {
  return simulate(() => {
    writeOwn(readOwn().filter((r) => r.id !== id));
  });
}

// ---------------------------------------------------------------------------
// Moderación (rol admin)
// ---------------------------------------------------------------------------

export type ModerationAction = 'aprobar' | 'ampliacion' | 'descartar' | 'canalizar' | 'cerrar';

const actionToStatus: Record<ModerationAction, ReportStatus> = {
  aprobar: 'verificado',
  ampliacion: 'en_revision',
  descartar: 'cerrado',
  canalizar: 'canalizado',
  cerrar: 'cerrado',
};

const actionToAudit = {
  aprobar: 'reporte_aprobado',
  ampliacion: 'reporte_ampliacion',
  descartar: 'reporte_descartado',
  canalizar: 'reporte_canalizado',
  cerrar: 'reporte_cerrado',
} as const;

const actionNotes: Record<ModerationAction, string> = {
  aprobar: 'Revisado como observación útil (no confirma ningún caso).',
  ampliacion: 'Se pidió ampliar la información del reporte.',
  descartar: 'Descartado.',
  canalizar: 'Canalizado al área responsable de la zona para su valoración.',
  cerrar: 'Seguimiento cerrado.',
};

/** Acciones válidas según el estado actual. */
export function allowedActions(status: ReportStatus): ModerationAction[] {
  switch (status) {
    case 'pendiente':
    case 'en_revision':
      return ['aprobar', 'ampliacion', 'descartar'];
    case 'verificado':
      return ['canalizar', 'cerrar'];
    case 'canalizado':
      return ['cerrar'];
    default:
      return [];
  }
}

export function getModerationQueue(): Promise<CitizenReport[]> {
  return simulate(() =>
    getAllReportsSync()
      .filter((r) => r.status !== 'cerrado')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

export function moderateReport(id: string, action: ModerationAction, reason: string, actorRole: UserRole): Promise<CitizenReport> {
  return simulate(() => {
    if (reason.trim().length < 5) throw new Error('Registra un motivo de al menos 5 caracteres.');
    const own = readOwn();
    const target = own.find((r) => r.id === id) ?? thirdPartyReports.find((r) => r.id === id);
    if (!target) throw new Error('Reporte no encontrado.');
    if (!allowedActions(target.status).includes(action)) throw new Error('La acción no es válida para el estado actual.');
    const status = actionToStatus[action];
    target.status = status;
    target.history.push({ status, at: new Date().toISOString(), note: `${actionNotes[action]} Motivo: ${reason.trim()}` });
    if (own.some((r) => r.id === id)) writeOwn(own);
    recordAudit({ actorRole, action: actionToAudit[action], entityType: 'reporte', entityId: target.folio, reason: reason.trim() });
    return target;
  });
}

// ---------------------------------------------------------------------------
// Agregados (panel institucional): sin datos personales ni texto libre
// ---------------------------------------------------------------------------

export interface AggregatedReportRow {
  regionId: string;
  week: string;
  category: ReportCategory;
  total: number;
  byStatus: Record<ReportStatus, number>;
}

export function getAggregatedReports(filters: { regionId: string | 'todas'; weeks: PeriodWeeks }): Promise<AggregatedReportRow[]> {
  return simulate(() => {
    const weekSet = new Set(lastWeeks(filters.weeks));
    const map = new Map<string, AggregatedReportRow>();
    for (const r of getAllReportsSync()) {
      const week = weekOf(r.createdAt);
      if (!weekSet.has(week)) continue;
      if (filters.regionId !== 'todas' && r.approximateZone !== filters.regionId) continue;
      const key = `${r.approximateZone}|${week}|${r.category}`;
      const row =
        map.get(key) ??
        ({
          regionId: r.approximateZone,
          week,
          category: r.category,
          total: 0,
          byStatus: { pendiente: 0, en_revision: 0, verificado: 0, canalizado: 0, cerrado: 0 },
        } satisfies AggregatedReportRow);
      row.total += 1;
      row.byStatus[r.status] += 1;
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => b.week.localeCompare(a.week) || a.regionId.localeCompare(b.regionId) || a.category.localeCompare(b.category));
  });
}

export interface ChannelZoneRow {
  regionId: string;
  sitio_movil: number;
  codigo_qr: number;
  aliado_comunitario: number;
}

/** Participación por zona y canal (últimas 4 semanas). */
export function getParticipationByChannel(): Promise<ChannelZoneRow[]> {
  return simulate(() => {
    const weekSet = new Set(lastWeeks(4));
    const rows = new Map<string, ChannelZoneRow>();
    for (const r of getAllReportsSync()) {
      if (!weekSet.has(weekOf(r.createdAt))) continue;
      const row = rows.get(r.approximateZone) ?? { regionId: r.approximateZone, sitio_movil: 0, codigo_qr: 0, aliado_comunitario: 0 };
      row[r.channel] += 1;
      rows.set(r.approximateZone, row);
    }
    return [...rows.values()];
  });
}
