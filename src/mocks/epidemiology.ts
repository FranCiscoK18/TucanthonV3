/**
 * Series epidemiológicas DEMO. Los totales semanales de la ciudad están diseñados a mano
 * para ilustrar distintos comportamientos (tendencia estable, descenso, aumento y conteos
 * bajos) y se reparten por zona de forma determinista. NO son datos oficiales.
 */
import type { AggregatedCase, DiseaseCategory, RegionId, VectorRecord } from '../types';
import { apportion, createRng, hashString } from '../utils/random';
import { getDemoClock } from './clock';
import { diseaseById, diseases } from './diseases';
import { regions } from './regions';

const OFFICIAL_SOURCE = 'fuente-registro-semanal';
const VECTOR_SOURCE = 'fuente-entomologica';

/** Totales semanales de la ciudad (16 semanas, de la más antigua a la más reciente). */
const CITY_SERIES: Record<string, readonly number[]> = {
  dengue: [18, 21, 24, 27, 31, 35, 38, 41, 39, 37, 36, 34, 36, 41, 58, 66],
  chikungunya: [4, 5, 3, 6, 5, 4, 6, 5, 7, 6, 5, 6, 5, 7, 6, 8],
  zika: [1, 0, 2, 1, 1, 0, 1, 2, 1, 1, 0, 1, 2, 1, 1, 2],
  influenza: [12, 11, 10, 12, 13, 12, 14, 15, 16, 18, 19, 20, 21, 22, 25, 27],
  'covid-19': [22, 25, 27, 24, 20, 18, 15, 14, 13, 12, 12, 11, 10, 11, 10, 9],
  ira: [410, 395, 402, 420, 433, 428, 445, 460, 472, 488, 495, 510, 530, 548, 560, 575],
  sarampion: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
  'tos-ferina': [1, 2, 1, 0, 2, 1, 3, 2, 1, 2, 2, 1, 3, 2, 2, 3],
  eda: [310, 325, 318, 300, 296, 288, 280, 276, 270, 262, 268, 255, 250, 248, 240, 236],
  'hepatitis-a': [3, 4, 2, 3, 5, 4, 3, 4, 6, 5, 4, 5, 6, 4, 5, 6],
  calor: [55, 60, 52, 48, 45, 40, 38, 30, 26, 22, 18, 15, 12, 10, 8, 6],
};

/** Modificadores por zona según la clasificación (además de la población estimada). */
const ZONE_MODIFIERS: Record<DiseaseCategory, Record<RegionId, number>> = {
  'transmitida-por-vector': { centro: 0.85, norte: 1, noroeste: 1.15, poniente: 1.2, sur: 1.3, bonfil: 1.15, 'zona-hotelera': 0.5 },
  'viral-respiratoria': { centro: 1, norte: 1, noroeste: 1, poniente: 1, sur: 1, bonfil: 1, 'zona-hotelera': 1.2 },
  'prevenible-por-vacunacion': { centro: 1, norte: 1, noroeste: 1, poniente: 1, sur: 1, bonfil: 1, 'zona-hotelera': 1 },
  enterica: { centro: 0.95, norte: 0.95, noroeste: 1.05, poniente: 0.95, sur: 1.1, bonfil: 1.35, 'zona-hotelera': 1.2 },
  otra: { centro: 1.15, norte: 1, noroeste: 1, poniente: 1, sur: 1, bonfil: 1, 'zona-hotelera': 2 },
};

/** El aumento reciente de dengue se concentra en dos zonas para ilustrar señales locales. */
const RECENT_DENGUE_SHIFT: Record<RegionId, number> = {
  centro: 0.8,
  norte: 0.8,
  noroeste: 0.85,
  poniente: 1.5,
  sur: 1.75,
  bonfil: 0.85,
  'zona-hotelera': 0.8,
};

function buildAggregatedCases(): AggregatedCase[] {
  const { weeks } = getDemoClock();
  const records: AggregatedCase[] = [];
  for (const [diseaseId, series] of Object.entries(CITY_SERIES)) {
    const disease = diseaseById.get(diseaseId);
    if (!disease) continue;
    const modifiers = ZONE_MODIFIERS[disease.category];
    weeks.forEach((week, weekIndex) => {
      const total = series[weekIndex] ?? 0;
      const rng = createRng(hashString(`${diseaseId}:${weekIndex}`));
      const weights = regions.map((region) => {
        const recent = diseaseId === 'dengue' && weekIndex >= weeks.length - 2 ? (RECENT_DENGUE_SHIFT[region.id] ?? 1) : 1;
        return region.populationEstimate * (modifiers[region.id] ?? 1) * recent * rng.float(0.85, 1.15);
      });
      const counts = apportion(total, weights);
      regions.forEach((region, regionIndex) => {
        records.push({
          id: `oficial-${diseaseId}-${region.id}-${week.id}`,
          diseaseId,
          regionId: region.id,
          weekId: week.id,
          weekStart: week.start,
          count: counts[regionIndex] ?? 0,
          source: 'oficial-demo',
          sourceId: OFFICIAL_SOURCE,
          isDemo: true,
        });
      });
    });
  }
  return records;
}

/** Porcentaje base de ovitrampas positivas por semana (estacional: pico en temporada de lluvias). */
const VECTOR_SEASONAL_PCT = [30, 33, 37, 42, 46, 50, 53, 55, 54, 52, 49, 46, 44, 42, 43, 45];
const VECTOR_ZONE_MODIFIER: Record<RegionId, number> = {
  centro: 0.8,
  norte: 0.9,
  noroeste: 1,
  poniente: 1.08,
  sur: 1.15,
  bonfil: 1.05,
  'zona-hotelera': 0.6,
};

function buildVectorRecords(): VectorRecord[] {
  const { weeks } = getDemoClock();
  const records: VectorRecord[] = [];
  for (const region of regions) {
    const traps = Math.min(80, Math.max(12, Math.round(region.populationEstimate / 2_500)));
    weeks.forEach((week, weekIndex) => {
      const rng = createRng(hashString(`vector:${region.id}:${weekIndex}`));
      const basePct = (VECTOR_SEASONAL_PCT[weekIndex] ?? 40) * (VECTOR_ZONE_MODIFIER[region.id] ?? 1) + rng.float(-4, 4);
      const inspected = traps - rng.int(0, 3);
      const positive = Math.max(0, Math.min(inspected, Math.round((inspected * basePct) / 100)));
      const positivityPct = Math.round((positive / inspected) * 1000) / 10;
      records.push({
        id: `vector-${region.id}-${week.id}`,
        regionId: region.id,
        weekId: week.id,
        weekStart: week.start,
        trapsInspected: inspected,
        trapsPositive: positive,
        positivityPct,
        meanEggs: Math.round(25 + positivityPct * 0.6 + rng.float(-5, 5)),
        source: 'entomologico-demo',
        sourceId: VECTOR_SOURCE,
        isDemo: true,
      });
    });
  }
  return records;
}

let casesCache: AggregatedCase[] | null = null;
let vectorCache: VectorRecord[] | null = null;

export function getAggregatedCasesMock(): AggregatedCase[] {
  casesCache ??= buildAggregatedCases();
  return casesCache;
}

export function getVectorRecordsMock(): VectorRecord[] {
  vectorCache ??= buildVectorRecords();
  return vectorCache;
}

/** Enfermedades con serie disponible (todas las del catálogo DEMO). */
export const diseasesWithSeries = diseases.filter((disease) => disease.id in CITY_SERIES).map((disease) => disease.id);
