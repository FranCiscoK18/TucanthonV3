import { alerts } from '../mocks/alerts';
import { brigades } from '../mocks/brigades';
import { aggregatedCases, diseaseById, diseases, vectorRecords } from '../mocks/diseases';
import { regions } from '../mocks/regions';
import { toReviewedObservations } from '../mocks/reports';
import { dataSources, sourceById } from '../mocks/sources';
import type {
  Alert,
  DataSource,
  Disease,
  DiseaseCategory,
  PeriodWeeks,
  Region,
  SignalResult,
  VaccinationBrigade,
} from '../types';
import { DEMO_CUTOFF_DATE, DEMO_WEEKS, lastWeeks } from '../utils/dates';
import { computeSignal } from '../utils/signals';
import { simulate } from './client';
import { getAllReportsSync } from './reportService';
import { weekOf } from './weeks';

// ---------------------------------------------------------------------------
// Inicio
// ---------------------------------------------------------------------------

export interface DiseaseSummary {
  disease: Disease;
  last4: number;
  previous4: number;
  series: number[];
  signal: SignalResult;
}

export interface HomeSummary {
  cutoffDate: string;
  summaries: DiseaseSummary[];
  alerts: Alert[];
  source: DataSource;
  reportsLast4Weeks: number;
}

function weeklySeries(diseaseId: string, regionId: string | 'todas' = 'todas', weeks: string[] = DEMO_WEEKS): number[] {
  return weeks.map((week) =>
    aggregatedCases
      .filter((c) => c.diseaseId === diseaseId && c.week === week && (regionId === 'todas' || c.regionId === regionId))
      .reduce((sum, c) => sum + c.count, 0),
  );
}

export function getHomeSummary(): Promise<HomeSummary> {
  return simulate(() => {
    const summaries = diseases.map((disease) => {
      const series = weeklySeries(disease.id);
      return {
        disease,
        last4: series.slice(-4).reduce((a, b) => a + b, 0),
        previous4: series.slice(-8, -4).reduce((a, b) => a + b, 0),
        series,
        signal: computeSignal(series, disease.id, 'todas'),
      };
    });
    const recent = new Set(lastWeeks(4));
    return {
      cutoffDate: DEMO_CUTOFF_DATE,
      summaries,
      alerts,
      source: sourceById('src-oficial')!,
      reportsLast4Weeks: getAllReportsSync().filter((r) => recent.has(weekOf(r.createdAt))).length,
    };
  });
}

// ---------------------------------------------------------------------------
// Mapa
// ---------------------------------------------------------------------------

export interface MapFilters {
  diseaseId: string | 'todas';
  category: DiseaseCategory | 'todas';
  weeks: PeriodWeeks;
  regionId: string | 'todas';
}

/** Conteos menores a este umbral se ocultan en capas ciudadanas (privacidad). */
export const SMALL_COUNT_THRESHOLD = 3;

export interface RegionLayerData {
  region: Region;
  official: number;
  /** Por 10 000 habitantes estimados. */
  estimatedRate: number;
  citizenUnverified: number;
  reviewed: number;
  vectorPositivity: number | null;
  vectorWeeksSampled: number;
  brigades: VaccinationBrigade[];
}

export interface MapData {
  filters: MapFilters;
  weeks: string[];
  regions: RegionLayerData[];
  maxOfficial: number;
  sources: DataSource[];
  cutoffDate: string;
}

function selectedDiseases(filters: MapFilters): Disease[] {
  return diseases.filter(
    (d) => (filters.diseaseId === 'todas' || d.id === filters.diseaseId) && (filters.category === 'todas' || d.category === filters.category),
  );
}

export function getMapData(filters: MapFilters): Promise<MapData> {
  return simulate(() => {
    const weeks = lastWeeks(filters.weeks);
    const weekSet = new Set(weeks);
    const chosen = selectedDiseases(filters);
    const diseaseIds = new Set(chosen.map((d) => d.id));
    const filteringReports = filters.diseaseId !== 'todas' || filters.category !== 'todas';
    const reportCategories = new Set(chosen.flatMap((d) => d.relatedReportCategories));
    const vectorRelevant = filters.diseaseId === 'todas' && filters.category === 'todas' ? true : chosen.some((d) => d.category === 'transmitida_por_vector');

    const reports = getAllReportsSync().filter(
      (r) => weekSet.has(weekOf(r.createdAt)) && (!filteringReports || reportCategories.has(r.category)),
    );
    const observations = toReviewedObservations(reports);

    const data = regions
      .filter((region) => filters.regionId === 'todas' || region.id === filters.regionId)
      .map<RegionLayerData>((region) => {
        const official = aggregatedCases
          .filter((c) => c.regionId === region.id && weekSet.has(c.week) && diseaseIds.has(c.diseaseId))
          .reduce((sum, c) => sum + c.count, 0);
        const vectors = vectorRecords.filter((v) => v.regionId === region.id && weekSet.has(v.week));
        return {
          region,
          official,
          estimatedRate: (official / region.estimatedPopulation) * 10000,
          citizenUnverified: reports.filter((r) => r.approximateZone === region.id && (r.status === 'pendiente' || r.status === 'en_revision')).length,
          reviewed: observations.filter((o) => o.regionId === region.id).length,
          vectorPositivity:
            vectorRelevant && vectors.length ? vectors.reduce((s, v) => s + v.ovitrapPositivity, 0) / vectors.length : null,
          vectorWeeksSampled: vectorRelevant ? vectors.length : 0,
          brigades: brigades.filter(
            (b) =>
              b.regionId === region.id &&
              b.status !== 'finalizada' &&
              (filters.diseaseId === 'todas' && filters.category === 'todas' ? true : b.diseaseIds.some((id) => diseaseIds.has(id))),
          ),
        };
      });
    return {
      filters,
      weeks,
      regions: data,
      maxOfficial: Math.max(1, ...data.map((d) => d.official)),
      sources: dataSources,
      cutoffDate: DEMO_CUTOFF_DATE,
    };
  });
}

// ---------------------------------------------------------------------------
// Enfermedades
// ---------------------------------------------------------------------------

export interface DiseaseListItem {
  disease: Disease;
  last4: number;
  signal: SignalResult;
  sparkline: number[];
}

export function getDiseases(): Promise<DiseaseListItem[]> {
  return simulate(() =>
    diseases.map((disease) => {
      const series = weeklySeries(disease.id);
      return {
        disease,
        last4: series.slice(-4).reduce((a, b) => a + b, 0),
        signal: computeSignal(series, disease.id, 'todas'),
        sparkline: series,
      };
    }),
  );
}

export interface DiseaseDetail {
  disease: Disease;
  source: DataSource;
  weeks: string[];
  series: number[];
  byRegion: Array<{ region: Region; series: number[]; total: number; signal: SignalResult }>;
  signal: SignalResult;
  cutoffDate: string;
}

export function getDiseaseDetail(id: string): Promise<DiseaseDetail | null> {
  return simulate(() => {
    const disease = diseaseById(id);
    if (!disease) return null;
    const series = weeklySeries(id);
    return {
      disease,
      source: sourceById(disease.sourceId)!,
      weeks: DEMO_WEEKS,
      series,
      byRegion: regions.map((region) => {
        const s = weeklySeries(id, region.id);
        return { region, series: s, total: s.reduce((a, b) => a + b, 0), signal: computeSignal(s, id, region.id) };
      }),
      signal: computeSignal(series, id, 'todas'),
      cutoffDate: DEMO_CUTOFF_DATE,
    };
  });
}

export function getRegions(): Promise<Region[]> {
  return simulate(() => regions);
}
