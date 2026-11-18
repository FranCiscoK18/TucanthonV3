/**
 * Indicadores del panel institucional, calculados sobre los reportes simulados.
 * Miden el funcionamiento del servicio (utilidad, oportunidad, seguimiento, cobertura y
 * sostenibilidad). Ninguno se presenta como causalidad clínica ni como incidencia.
 */
import { MIN_PUBLIC_COUNT, PILOT, VECTOR_THRESHOLD_PCT } from '../config/demo';
import { getDemoClock } from '../mocks/clock';
import { diseases } from '../mocks/diseases';
import { getVectorRecordsMock } from '../mocks/epidemiology';
import { pilotQuestions, pilotStages } from '../mocks/pilot';
import { regionById, regionName, regions, totalPopulationEstimate } from '../mocks/regions';
import { channelLabels, reportCategoryLabels, reportStatusLabels, reportStatusOrder } from '../mocks/reports';
import type {
  AggregatedReportRow,
  CitizenReport,
  Indicator,
  InstitutionalSummary,
  PeriodKey,
  PilotOverview,
  PriorityZone,
  RegionId,
  ReportCategory,
  ReportChannel,
  ReportStatus,
  SessionRole,
} from '../types';
import { epiWeekOf, formatWeekRange, hoursBetween, isoToCancunDate } from '../utils/dates';
import { toCsv } from '../utils/csv';
import { appendAudit } from './auditService';
import { simulateRequest } from './client';
import { periodLabels, signalFor, weeksForPeriod } from './epidemiologyService';
import { hasReviewDecision, isUsefulObservation } from './moderation';
import { getAllReportsSnapshot } from './reportService';

export interface InstitutionalFilters {
  regionId: RegionId | 'todas';
  period: PeriodKey;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 === 0 ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2 : (sorted[middle] ?? 0);
  return Math.round(value * 10) / 10;
}

function percent(numerator: number, denominator: number): number | null {
  return denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : null;
}

function filteredReports(filters: InstitutionalFilters): CitizenReport[] {
  const firstDay = weeksForPeriod(filters.period)[0]?.start ?? getDemoClock().cutoff;
  return getAllReportsSnapshot().filter(
    (report) =>
      isoToCancunDate(report.createdAt) >= firstDay &&
      (filters.regionId === 'todas' || report.approximateZone === filters.regionId),
  );
}

function firstAction(report: CitizenReport, action: CitizenReport['history'][number]['action']) {
  return report.history.find((change) => change.action === action);
}

const CHANNELS: ReportChannel[] = ['sitio-movil', 'codigo-qr', 'aliado-comunitario'];

function buildSummary(filters: InstitutionalFilters): InstitutionalSummary {
  const weeks = weeksForPeriod(filters.period);
  const reports = filteredReports(filters);
  const decided = reports.filter(hasReviewDecision);
  const useful = decided.filter(isUsefulObservation);

  const toReview = reports
    .map((report) => {
      const first = report.history.find((change) => change.action !== 'envio');
      return first ? hoursBetween(first.at, report.createdAt) : null;
    })
    .filter((value): value is number => value !== null);
  const toChannel = reports
    .map((report) => {
      const approved = firstAction(report, 'aprobar');
      const channeled = firstAction(report, 'canalizar');
      return approved && channeled ? hoursBetween(channeled.at, approved.at) : null;
    })
    .filter((value): value is number => value !== null);

  const channeled = reports.filter((report) => firstAction(report, 'canalizar'));
  const withResponsible = channeled.filter((report) => Boolean(report.assignedTo));
  const documented = channeled.filter(
    (report) =>
      report.status === 'cerrado' &&
      (report.closure?.outcome === 'atendido-por-autoridad' || report.closure?.outcome === 'sin-accion-documentada'),
  );

  const scopeRegions = filters.regionId === 'todas' ? regions : regions.filter((region) => region.id === filters.regionId);
  const population =
    filters.regionId === 'todas' ? totalPopulationEstimate : (regionById.get(filters.regionId)?.populationEstimate ?? 1);
  const coverageByZone = scopeRegions.map((region) => {
    const count = reports.filter((report) => report.approximateZone === region.id).length;
    return { regionId: region.id, reports: count, ratePer100k: Math.round((count / region.populationEstimate) * 1_000_000) / 10 };
  });
  const coverageByChannel = CHANNELS.map((channel) => {
    const count = reports.filter((report) => report.channel === channel).length;
    return { channel, reports: count, share: percent(count, reports.length) ?? 0 };
  });
  const zonesWithParticipation = coverageByZone.filter((row) => row.reports > 0).length;

  const periodCost = PILOT.weeklyOperatingCostMXN * weeks.length;
  const costPerUseful = useful.length > 0 ? Math.round(periodCost / useful.length) : null;

  const indicators: Indicator[] = [
    {
      id: 'utilidad',
      dimension: 'utilidad',
      name: 'Reportes útiles',
      definition: 'Reportes completos, pertinentes y no duplicados entre los que ya tienen decisión de moderación.',
      formula: 'reportes útiles ÷ reportes con decisión × 100',
      value: percent(useful.length, decided.length),
      unit: '%',
      numerator: useful.length,
      denominator: decided.length,
      target: 60,
      targetDirection: 'mayor-o-igual',
      caveat: 'Mide la calidad de la información recibida, no la situación de salud.',
      isDemo: true,
    },
    {
      id: 'oportunidad-revision',
      dimension: 'oportunidad',
      name: 'De recepción a revisión',
      definition: 'Mediana de horas entre la recepción de un reporte y el inicio de su revisión.',
      formula: 'mediana(inicio de revisión − recepción)',
      value: median(toReview),
      unit: 'horas',
      denominator: toReview.length,
      target: 24,
      targetDirection: 'menor-o-igual',
      caveat: 'Depende de la carga de trabajo y del horario del equipo de moderación.',
      isDemo: true,
    },
    {
      id: 'oportunidad-canalizacion',
      dimension: 'oportunidad',
      name: 'De revisión a canalización',
      definition: 'Mediana de horas entre la aprobación de un reporte y su canalización a la instancia responsable.',
      formula: 'mediana(canalización − aprobación)',
      value: median(toChannel),
      unit: 'horas',
      denominator: toChannel.length,
      target: 48,
      targetDirection: 'menor-o-igual',
      caveat: 'Canalizar no implica que la autoridad haya aceptado actuar.',
      isDemo: true,
    },
    {
      id: 'seguimiento-responsable',
      dimension: 'seguimiento',
      name: 'Con responsable asignado',
      definition: 'Reportes canalizados que tienen una instancia responsable designada.',
      formula: 'canalizados con responsable ÷ canalizados × 100',
      value: percent(withResponsible.length, channeled.length),
      unit: '%',
      numerator: withResponsible.length,
      denominator: channeled.length,
      target: 90,
      targetDirection: 'mayor-o-igual',
      caveat: 'La designación de responsables la decide la autoridad, no la plataforma.',
      isDemo: true,
    },
    {
      id: 'seguimiento-cierre',
      dimension: 'seguimiento',
      name: 'Con cierre documentado',
      definition: 'Reportes canalizados cuyo seguimiento se cerró con una nota documentada.',
      formula: 'canalizados con cierre documentado ÷ canalizados × 100',
      value: percent(documented.length, channeled.length),
      unit: '%',
      numerator: documented.length,
      denominator: channeled.length,
      target: 70,
      targetDirection: 'mayor-o-igual',
      caveat: 'Un cierre documentado no significa que se haya resuelto un problema de salud.',
      isDemo: true,
    },
    {
      id: 'cobertura-participacion',
      dimension: 'cobertura',
      name: 'Participación',
      definition: 'Reportes recibidos por cada 100 mil habitantes (población de referencia).',
      formula: 'reportes ÷ población estimada × 100 000',
      value: Math.round((reports.length / population) * 1_000_000) / 10,
      unit: 'por 100 mil hab.',
      numerator: reports.length,
      caveat:
        'Sesgo de selección: participan más las zonas con códigos QR, aliados comunitarios o mejor conectividad. No es una medida de riesgo.',
      isDemo: true,
    },
    {
      id: 'cobertura-zonas',
      dimension: 'cobertura',
      name: 'Zonas con participación',
      definition: 'Zonas del alcance seleccionado con al menos un reporte en el periodo.',
      formula: 'zonas con reportes ÷ zonas × 100',
      value: percent(zonesWithParticipation, scopeRegions.length),
      unit: '%',
      numerator: zonesWithParticipation,
      denominator: scopeRegions.length,
      caveat: 'Que una zona no tenga reportes no significa que no tenga riesgos.',
      isDemo: true,
    },
    {
      id: 'sostenibilidad-costo',
      dimension: 'sostenibilidad',
      name: 'Costo por reporte útil',
      definition: 'Costo operativo ilustrativo del periodo dividido entre los reportes útiles.',
      formula: 'costo operativo del periodo ÷ reportes útiles',
      value: costPerUseful,
      unit: 'MXN',
      numerator: periodCost,
      denominator: useful.length,
      target: 2_500,
      targetDirection: 'menor-o-igual',
      caveat: 'Costo de referencia. El modelo no contempla cobros a la ciudadanía, comisiones ni subsidios.',
      isDemo: true,
    },
  ];

  return {
    periodLabel: `${periodLabels[filters.period]} · ${formatWeekRange(weeks)} y semana en curso`,
    regionLabel: filters.regionId === 'todas' ? 'Todas las zonas' : regionName(filters.regionId),
    totalReports: reports.length,
    reviewedReports: decided.length,
    indicators,
    coverageByZone,
    coverageByChannel,
    weeklyCostMXN: PILOT.weeklyOperatingCostMXN,
  };
}

export async function getInstitutionalSummary(filters: InstitutionalFilters): Promise<InstitutionalSummary> {
  return simulateRequest(() => buildSummary(filters));
}

/** Zonas prioritarias con criterio explícito. La prioridad final la define la autoridad. */
export async function getPriorityZones(): Promise<PriorityZone[]> {
  return simulateRequest(() => {
    const { weeks } = getDemoClock();
    const latestWeek = weeks[weeks.length - 1];
    const firstDay = weeks[weeks.length - 4]?.start ?? getDemoClock().cutoff;
    const recentReports = getAllReportsSnapshot().filter((report) => isoToCancunDate(report.createdAt) >= firstDay);
    return regions
      .map((region): PriorityZone => {
        const signals = diseases.map((disease) => signalFor(disease.id, region.id)).filter((signal) => signal.status === 'senal');
        const officialRatio = signals.reduce<number | null>(
          (max, signal) => (signal.ratio !== null && (max === null || signal.ratio > max) ? signal.ratio : max),
          null,
        );
        const vector = getVectorRecordsMock().find((record) => record.regionId === region.id && record.weekId === latestWeek?.id);
        const vectorAboveThreshold = (vector?.positivityPct ?? 0) >= VECTOR_THRESHOLD_PCT;
        const zoneReports = recentReports.filter((report) => report.approximateZone === region.id);
        const reviewedBreeding = zoneReports.filter(
          (report) => report.category === 'posible-criadero' && isUsefulObservation(report),
        ).length;
        const unverified = zoneReports.filter((report) => report.status === 'pendiente' || report.status === 'en_revision').length;

        const reasons: string[] = [];
        if (signals.length > 0) {
          reasons.push(
            `Señal estadística en registros ilustrativos: ${signals.map((signal) => diseases.find((d) => d.id === signal.diseaseId)?.shortName).join(', ')}.`,
          );
        }
        if (vectorAboveThreshold) reasons.push(`Ovitrampas positivas en ${vector?.positivityPct ?? 0} % (umbral de referencia ${VECTOR_THRESHOLD_PCT} %).`);
        if (reviewedBreeding >= MIN_PUBLIC_COUNT) {
          reasons.push(`${reviewedBreeding} observaciones revisadas de posibles criaderos en las últimas 4 semanas.`);
        }
        const score = (signals.length > 0 ? 2 : 0) + (vectorAboveThreshold ? 1 : 0) + (reviewedBreeding >= MIN_PUBLIC_COUNT ? 1 : 0);
        return {
          regionId: region.id,
          score,
          officialSignal: signals.length > 0,
          officialRatio,
          vectorPositivityPct: vector?.positivityPct ?? null,
          vectorAboveThreshold,
          unverifiedReports: unverified,
          reasons,
        };
      })
      .sort((a, b) => b.score - a.score || (b.officialRatio ?? 0) - (a.officialRatio ?? 0));
  });
}

export interface AggregatedPivotRow {
  regionId: RegionId;
  category: ReportCategory;
  counts: Record<ReportStatus, number>;
  total: number;
}

function emptyCounts(): Record<ReportStatus, number> {
  return { pendiente: 0, en_revision: 0, verificado: 0, canalizado: 0, cerrado: 0 };
}

function longRows(reports: readonly CitizenReport[]): AggregatedReportRow[] {
  const groups = new Map<string, AggregatedReportRow>();
  for (const report of reports) {
    const week = epiWeekOf(isoToCancunDate(report.createdAt));
    const key = [report.approximateZone, week.id, report.category, report.status].join('|');
    const existing = groups.get(key);
    if (existing) existing.count += 1;
    else {
      groups.set(key, {
        regionId: report.approximateZone,
        weekId: week.id,
        weekLabel: `${week.label} · ${week.year}`,
        category: report.category,
        status: report.status,
        count: 1,
      });
    }
  }
  return [...groups.values()].sort(
    (a, b) =>
      a.weekId.localeCompare(b.weekId) ||
      regionName(a.regionId).localeCompare(regionName(b.regionId), 'es') ||
      a.category.localeCompare(b.category),
  );
}

export async function getAggregatedReportTable(filters: InstitutionalFilters): Promise<AggregatedPivotRow[]> {
  return simulateRequest(() => {
    const pivot = new Map<string, AggregatedPivotRow>();
    for (const report of filteredReports(filters)) {
      const key = `${report.approximateZone}|${report.category}`;
      const row = pivot.get(key) ?? {
        regionId: report.approximateZone,
        category: report.category,
        counts: emptyCounts(),
        total: 0,
      };
      row.counts[report.status] += 1;
      row.total += 1;
      pivot.set(key, row);
    }
    return [...pivot.values()].sort(
      (a, b) => regionName(a.regionId).localeCompare(regionName(b.regionId), 'es') || b.total - a.total,
    );
  });
}

/** Exportación simulada: genera el CSV en el navegador, solo con conteos agregados. */
export async function exportAggregatedReportsCsv(
  filters: InstitutionalFilters,
  actor: { role: SessionRole; label: string },
): Promise<{ filename: string; content: string; rows: number }> {
  return simulateRequest(() => {
    const rows = longRows(filteredReports(filters));
    const content = toCsv(
      ['zona', 'semana_epidemiologica', 'categoria', 'estado', 'conteo', 'es_demo'],
      rows.map((row) => [
        regionName(row.regionId),
        row.weekLabel,
        reportCategoryLabels[row.category],
        reportStatusLabels[row.status],
        row.count,
        true,
      ]),
    );
    const { today } = getDemoClock();
    const scope = filters.regionId === 'todas' ? 'todas-las-zonas' : filters.regionId;
    appendAudit({
      actorRole: actor.role,
      actorLabel: actor.label,
      actionCode: 'exportacion-csv',
      action: 'Exportación CSV de reportes agregados',
      entityType: 'exportacion',
      entityId: `reportes-agregados-${scope}`,
      detail: `${rows.length} filas agregadas (${periodLabels[filters.period].toLowerCase()}). Sin datos personales.`,
    });
    return { filename: `ondara-reportes-agregados-${scope}-${today}.csv`, content, rows: rows.length };
  });
}

export async function getPilotOverview(): Promise<PilotOverview> {
  return simulateRequest(() => ({
    currentDay: PILOT.currentDay,
    totalDays: PILOT.totalDays,
    stages: pilotStages,
    questions: pilotQuestions,
  }));
}

export const statusColumns = reportStatusOrder;
export { channelLabels };
