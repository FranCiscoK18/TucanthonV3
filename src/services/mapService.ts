/**
 * Datos agregados por zona para las seis capas del mapa. Cada capa se calcula por
 * separado y conserva su fuente: nunca se mezclan datos oficiales DEMO con reportes ciudadanos.
 */
import { MIN_PUBLIC_COUNT, VECTOR_THRESHOLD_PCT } from '../config/demo';
import { getActivitiesMock } from '../mocks/activities';
import { getDemoClock } from '../mocks/clock';
import { categoryLabels, diseaseById, diseases } from '../mocks/diseases';
import { getAggregatedCasesMock, getVectorRecordsMock } from '../mocks/epidemiology';
import { regions } from '../mocks/regions';
import type { CitizenReport, MapDataset, MapFilters, PublishedCount, ZoneLayerValues } from '../types';
import { addDays, formatDate, formatDateTime, formatWeekRange, isoToCancunDate } from '../utils/dates';
import { simulateRequest } from './client';
import { weeksForPeriod } from './epidemiologyService';
import { getAllReportsSnapshot } from './reportService';
import { isUsefulObservation } from './moderation';

/** Publica un conteo suprimiendo valores pequeños (p. ej. «<3») en vistas públicas. */
export function publishCount(value: number): PublishedCount {
  if (value > 0 && value < MIN_PUBLIC_COUNT) {
    return { value, display: `<${MIN_PUBLIC_COUNT}`, suppressed: true };
  }
  return { value, display: String(value), suppressed: false };
}

export function resolveDiseaseIds(filters: Pick<MapFilters, 'diseaseId' | 'category'>): string[] {
  if (filters.diseaseId !== 'todas') {
    const disease = diseaseById.get(filters.diseaseId);
    if (!disease) return [];
    return filters.category === 'todas' || disease.category === filters.category ? [disease.id] : [];
  }
  return diseases.filter((disease) => filters.category === 'todas' || disease.category === filters.category).map((d) => d.id);
}

function diseaseLabel(filters: MapFilters): string {
  if (filters.diseaseId !== 'todas') return diseaseById.get(filters.diseaseId)?.name ?? 'Selección';
  if (filters.category !== 'todas') return `Todas las de «${categoryLabels[filters.category]}»`;
  return 'Todas las enfermedades y señales';
}

/**
 * Límites superiores de 5 clases de intervalos iguales entre 1 y el máximo.
 * La clase 0 se reserva para «sin registros».
 */
function equalIntervalBreaks(max: number): number[] {
  if (max <= 0) return [];
  return [0.2, 0.4, 0.6, 0.8, 1].map((fraction) => Math.max(1, Math.ceil(max * fraction)));
}

function binFor(value: number, breaks: readonly number[]): number {
  if (value <= 0) return 0;
  const index = breaks.findIndex((limit) => value <= limit);
  return index === -1 ? breaks.length : index + 1;
}

/** Los reportes ciudadanos del periodo incluyen la semana en curso (se actualizan de forma continua). */
function reportsInPeriod(reports: readonly CitizenReport[], firstDay: string): CitizenReport[] {
  return reports.filter((report) => isoToCancunDate(report.createdAt) >= firstDay);
}

export interface ParticipationSummary {
  /** Reportes recibidos en la semana en curso. */
  thisWeek: PublishedCount;
  /** Reportes pendientes o en revisión (todas las zonas). */
  unverified: PublishedCount;
  /** Observaciones revisadas como útiles en las últimas 4 semanas. */
  reviewed: PublishedCount;
  updatedAt: string;
}

/** Resumen público de participación, con supresión de conteos pequeños. */
export async function getParticipationSummary(): Promise<ParticipationSummary> {
  return simulateRequest(() => {
    const clock = getDemoClock();
    const reports = getAllReportsSnapshot();
    const fourWeeksStart = weeksForPeriod('ultimas-4')[0]?.start ?? clock.cutoff;
    return {
      thisWeek: publishCount(reports.filter((report) => isoToCancunDate(report.createdAt) >= clock.currentWeek.start).length),
      unverified: publishCount(reports.filter((report) => report.status === 'pendiente' || report.status === 'en_revision').length),
      reviewed: publishCount(
        reports.filter((report) => isoToCancunDate(report.createdAt) >= fourWeeksStart && isUsefulObservation(report)).length,
      ),
      updatedAt: formatDateTime(new Date().toISOString()),
    };
  });
}

export async function getMapDataset(filters: MapFilters): Promise<MapDataset> {
  return simulateRequest(() => {
    const clock = getDemoClock();
    const weeks = weeksForPeriod(filters.period);
    const weekIds = new Set(weeks.map((week) => week.id));
    const diseaseIds = new Set(resolveDiseaseIds(filters));
    const firstDay = weeks[0]?.start ?? clock.cutoff;

    const officialByZone = new Map<string, number>();
    for (const record of getAggregatedCasesMock()) {
      if (!diseaseIds.has(record.diseaseId) || !weekIds.has(record.weekId)) continue;
      officialByZone.set(record.regionId, (officialByZone.get(record.regionId) ?? 0) + record.count);
    }
    const maxOfficial = Math.max(0, ...officialByZone.values());
    const officialBreaks = equalIntervalBreaks(maxOfficial);

    const periodReports = reportsInPeriod(getAllReportsSnapshot(), firstDay);
    const vectorAvailable = [...diseaseIds].some((id) => diseaseById.get(id)?.hasVectorData);
    const vectorRecords = getVectorRecordsMock().filter((record) => weekIds.has(record.weekId));

    const zones: ZoneLayerValues[] = regions.map((region) => {
      const official = officialByZone.get(region.id) ?? 0;
      const zoneReports = periodReports.filter((report) => report.approximateZone === region.id);
      const unverified = zoneReports.filter((report) => report.status === 'pendiente' || report.status === 'en_revision');
      const reviewed = zoneReports.filter(isUsefulObservation);
      const zoneVector = vectorRecords.filter((record) => record.regionId === region.id);
      const inspected = zoneVector.reduce((total, record) => total + record.trapsInspected, 0);
      const positive = zoneVector.reduce((total, record) => total + record.trapsPositive, 0);
      const positivityPct = inspected > 0 ? Math.round((positive / inspected) * 1000) / 10 : 0;
      return {
        regionId: region.id,
        oficial: { count: official, bin: binFor(official, officialBreaks) },
        estimado: {
          ratePer10k: Math.round((official / region.populationEstimate) * 100_000) / 10,
          population: region.populationEstimate,
        },
        reportes: publishCount(unverified.length),
        observaciones: publishCount(reviewed.length),
        vectorial: vectorAvailable
          ? { positivityPct, trapsInspected: inspected, aboveThreshold: positivityPct >= VECTOR_THRESHOLD_PCT }
          : null,
      };
    });

    const horizon = addDays(clock.today, 14);
    const activities = getActivitiesMock().filter(
      (activity) =>
        activity.status !== 'finalizada' &&
        activity.date >= clock.today &&
        activity.date <= horizon &&
        (diseaseIds.size === diseases.length || activity.diseaseIds.some((id) => diseaseIds.has(id))),
    );

    return {
      periodLabel: formatWeekRange(weeks),
      officialCutoff: formatDate(clock.cutoff),
      participationUpdatedAt: formatDateTime(new Date().toISOString()),
      diseaseLabel: diseaseLabel(filters),
      zones,
      activities,
      officialBreaks,
      vectorAvailable,
    };
  });
}
