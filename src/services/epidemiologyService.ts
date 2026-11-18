/**
 * Agregados epidemiológicos simulados: catálogo, series, señales y comparación de periodos.
 * Todos los conteos son DEMO y se presentan agregados por zona y semana.
 */
import { SIGNAL_CRITERIA } from '../config/demo';
import { getDemoClock } from '../mocks/clock';
import { categoryOrder, diseaseById, diseases } from '../mocks/diseases';
import { getAggregatedCasesMock, getVectorRecordsMock } from '../mocks/epidemiology';
import { regions } from '../mocks/regions';
import { getDataSourcesMock } from '../mocks/sources';
import type {
  DataSource,
  Disease,
  EpiWeek,
  PeriodKey,
  RegionId,
  SignalEvaluation,
  SignalStatus,
  WeeklyPoint,
} from '../types';
import { formatWeekRange } from '../utils/dates';
import { evaluateSignal } from '../utils/signals';
import { NotFoundError, simulateRequest } from './client';

export const periodLabels: Record<PeriodKey, string> = {
  ultima: 'Última semana',
  'ultimas-4': 'Últimas 4 semanas',
  'ultimas-8': 'Últimas 8 semanas',
  'ultimas-12': 'Últimas 12 semanas',
};

const PERIOD_WEEKS: Record<PeriodKey, number> = { ultima: 1, 'ultimas-4': 4, 'ultimas-8': 8, 'ultimas-12': 12 };

export function weeksForPeriod(period: PeriodKey): EpiWeek[] {
  return getDemoClock().weeks.slice(-PERIOD_WEEKS[period]);
}

/** Serie semanal (16 semanas) para un conjunto de enfermedades, en la ciudad o en una zona. */
export function weeklySeries(diseaseIds: readonly string[], scope: RegionId | 'ciudad' = 'ciudad'): WeeklyPoint[] {
  const { weeks } = getDemoClock();
  const totals = new Map<string, number>();
  for (const record of getAggregatedCasesMock()) {
    if (!diseaseIds.includes(record.diseaseId)) continue;
    if (scope !== 'ciudad' && record.regionId !== scope) continue;
    totals.set(record.weekId, (totals.get(record.weekId) ?? 0) + record.count);
  }
  return weeks.map((week) => ({
    weekId: week.id,
    label: week.label,
    start: week.start,
    end: week.end,
    value: totals.get(week.id) ?? 0,
  }));
}

export function signalFor(diseaseId: string, scope: RegionId | 'ciudad' = 'ciudad'): SignalEvaluation {
  const series = weeklySeries([diseaseId], scope);
  const result = evaluateSignal(
    series.map((point) => point.value),
    SIGNAL_CRITERIA,
  );
  const { weeks } = getDemoClock();
  const window = weeks.slice(-SIGNAL_CRITERIA.windowWeeks);
  const baseline = weeks.slice(-(SIGNAL_CRITERIA.windowWeeks + SIGNAL_CRITERIA.baselineWeeks), -SIGNAL_CRITERIA.windowWeeks);
  return {
    diseaseId,
    scope,
    ...result,
    criteria: SIGNAL_CRITERIA,
    windowLabel: formatWeekRange(window),
    baselineLabel: formatWeekRange(baseline),
  };
}

function sum(points: readonly WeeklyPoint[]): number {
  return points.reduce((total, point) => total + point.value, 0);
}

export interface DiseaseCatalogItem {
  disease: Disease;
  sparkline: number[];
  last4: number;
  previous4: number;
  signal: SignalEvaluation;
}

export interface DiseaseCatalog {
  items: DiseaseCatalogItem[];
  zoneSignals: SignalEvaluation[];
  cutoff: string;
  source: DataSource;
  seriesLabel: string;
}

function officialSource(): DataSource {
  const source = getDataSourcesMock().find((item) => item.id === 'fuente-registro-semanal');
  if (!source) throw new NotFoundError('Fuente DEMO no encontrada.');
  return source;
}

function buildCatalog(): DiseaseCatalog {
  const clock = getDemoClock();
  const ordered = [...diseases].sort(
    (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || a.name.localeCompare(b.name, 'es'),
  );
  const items = ordered.map((disease) => {
    const series = weeklySeries([disease.id]);
    return {
      disease,
      sparkline: series.slice(-8).map((point) => point.value),
      last4: sum(series.slice(-4)),
      previous4: sum(series.slice(-8, -4)),
      signal: signalFor(disease.id),
    };
  });
  const zoneSignals = diseases.flatMap((disease) =>
    regions.map((region) => signalFor(disease.id, region.id)).filter((signal) => signal.status === 'senal'),
  );
  return { items, zoneSignals, cutoff: clock.cutoff, source: officialSource(), seriesLabel: formatWeekRange(clock.weeks) };
}

export async function getDiseaseCatalog(): Promise<DiseaseCatalog> {
  return simulateRequest(buildCatalog);
}

export interface ZoneBreakdownRow {
  regionId: RegionId;
  last4: number;
  previous4: number;
  status: SignalStatus;
  ratio: number | null;
}

export interface DiseaseDetail {
  disease: Disease;
  scope: RegionId | 'ciudad';
  series: WeeklyPoint[];
  signal: SignalEvaluation;
  comparison: {
    current: { label: string; total: number };
    previous: { label: string; total: number };
    lastYear: { label: string; total: number };
  };
  zones: ZoneBreakdownRow[];
  vectorSeries: WeeklyPoint[] | null;
  source: DataSource;
  cutoff: string;
}

export async function getDiseaseDetail(id: string, scope: RegionId | 'ciudad'): Promise<DiseaseDetail> {
  return simulateRequest(() => {
    const disease = diseaseById.get(id);
    if (!disease) throw new NotFoundError('No encontramos esa enfermedad o señal en el catálogo DEMO.');
    const clock = getDemoClock();
    const series = weeklySeries([id], scope);
    const current = series.slice(-4);
    const previous = series.slice(-8, -4);
    const currentTotal = sum(current);
    // Referencia ilustrativa del mismo periodo del año anterior (DEMO, no es un dato histórico real).
    const lastYearTotal = Math.round(currentTotal * (disease.category === 'transmitida-por-vector' ? 0.78 : 0.92));

    const zones = regions.map((region) => {
      const zoneSeries = weeklySeries([id], region.id);
      const signal = signalFor(id, region.id);
      return {
        regionId: region.id,
        last4: sum(zoneSeries.slice(-4)),
        previous4: sum(zoneSeries.slice(-8, -4)),
        status: signal.status,
        ratio: signal.ratio,
      };
    });

    let vectorSeries: WeeklyPoint[] | null = null;
    if (disease.hasVectorData) {
      const records = getVectorRecordsMock().filter((record) => scope === 'ciudad' || record.regionId === scope);
      vectorSeries = clock.weeks.map((week) => {
        const inWeek = records.filter((record) => record.weekId === week.id);
        const inspected = inWeek.reduce((total, record) => total + record.trapsInspected, 0);
        const positive = inWeek.reduce((total, record) => total + record.trapsPositive, 0);
        return {
          weekId: week.id,
          label: week.label,
          start: week.start,
          end: week.end,
          value: inspected > 0 ? Math.round((positive / inspected) * 1000) / 10 : 0,
        };
      });
    }

    const weeks = clock.weeks;
    return {
      disease,
      scope,
      series,
      signal: signalFor(id, scope),
      comparison: {
        current: { label: formatWeekRange(weeks.slice(-4)), total: currentTotal },
        previous: { label: formatWeekRange(weeks.slice(-8, -4)), total: sum(previous) },
        lastYear: { label: 'Mismo periodo del año anterior (referencia DEMO)', total: lastYearTotal },
      },
      zones,
      vectorSeries,
      source: officialSource(),
      cutoff: clock.cutoff,
    };
  });
}
