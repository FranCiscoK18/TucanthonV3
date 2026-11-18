import type { AggregatedCase, Disease, DiseaseCategory, VectorRecord } from '../types';
import { DEMO_WEEKS } from '../utils/dates';
import { regions } from './regions';
import { createRng, hashString } from './seed';

export const diseaseCategoryLabels: Record<DiseaseCategory, string> = {
  viral_respiratoria: 'Viral respiratoria',
  transmitida_por_vector: 'Transmitida por vector',
  prevenible_por_vacunacion: 'Prevenible por vacunación',
  enterica: 'Entérica',
  otra: 'Otra',
};

/** Catálogo informativo. Descripciones generales, no orientación clínica. */
export const diseases: Disease[] = [
  {
    id: 'dengue',
    name: 'Dengue',
    category: 'transmitida_por_vector',
    description:
      'Infección viral transmitida por la picadura de mosquitos Aedes. Su vigilancia combina notificación de servicios de salud y monitoreo de criaderos.',
    prevention: 'Eliminar recipientes con agua estancada, usar mosquiteros y repelente, y acudir a servicios de salud ante síntomas.',
    sourceId: 'src-oficial',
    relatedReportCategories: ['posible_criadero', 'riesgo_ambiental'],
    isDemo: true,
  },
  {
    id: 'chikungunya',
    name: 'Chikungunya',
    category: 'transmitida_por_vector',
    description: 'Infección viral transmitida por mosquitos Aedes, del mismo vector que el dengue.',
    prevention: 'Las mismas medidas de control de criaderos y protección personal que para el dengue.',
    sourceId: 'src-oficial',
    relatedReportCategories: ['posible_criadero'],
    isDemo: true,
  },
  {
    id: 'zika',
    name: 'Zika',
    category: 'transmitida_por_vector',
    description: 'Infección viral transmitida principalmente por mosquitos Aedes; requiere atención especial durante el embarazo.',
    prevention: 'Control de criaderos, protección contra picaduras y orientación médica en el embarazo.',
    sourceId: 'src-oficial',
    relatedReportCategories: ['posible_criadero'],
    isDemo: true,
  },
  {
    id: 'influenza',
    name: 'Influenza',
    category: 'viral_respiratoria',
    description: 'Infección respiratoria viral estacional. Su comportamiento suele aumentar en temporada fría.',
    prevention: 'Vacunación anual, lavado de manos, cubrirse al toser y quedarse en casa con síntomas.',
    sourceId: 'src-oficial',
    relatedReportCategories: ['sintomas_agregados'],
    isDemo: true,
  },
  {
    id: 'covid19',
    name: 'COVID-19',
    category: 'viral_respiratoria',
    description: 'Infección respiratoria causada por SARS-CoV-2.',
    prevention: 'Vacunación según esquema vigente, ventilación de espacios y medidas de higiene respiratoria.',
    sourceId: 'src-oficial',
    relatedReportCategories: ['sintomas_agregados'],
    isDemo: true,
  },
  {
    id: 'sarampion',
    name: 'Sarampión',
    category: 'prevenible_por_vacunacion',
    description: 'Infección viral muy contagiosa prevenible con vacuna. Cualquier notificación requiere evaluación por la autoridad.',
    prevention: 'Completar el esquema de vacunación (SRP / SR) según la edad.',
    sourceId: 'src-oficial',
    relatedReportCategories: ['sintomas_agregados'],
    isDemo: true,
  },
  {
    id: 'tosferina',
    name: 'Tos ferina',
    category: 'prevenible_por_vacunacion',
    description: 'Infección respiratoria bacteriana prevenible por vacunación, de mayor riesgo en lactantes.',
    prevention: 'Vacunación infantil y durante el embarazo según indicación de la autoridad sanitaria.',
    sourceId: 'src-oficial',
    relatedReportCategories: ['sintomas_agregados'],
    isDemo: true,
  },
  {
    id: 'eda',
    name: 'Enfermedad diarreica aguda',
    category: 'enterica',
    description: 'Grupo de infecciones gastrointestinales asociadas a agua o alimentos contaminados.',
    prevention: 'Agua segura, lavado de manos, manejo higiénico de alimentos e hidratación oral.',
    sourceId: 'src-oficial',
    relatedReportCategories: ['riesgo_ambiental', 'sintomas_agregados'],
    isDemo: true,
  },
  {
    id: 'hepatitis-a',
    name: 'Hepatitis A',
    category: 'enterica',
    description: 'Infección hepática viral transmitida por agua o alimentos contaminados.',
    prevention: 'Saneamiento, agua segura, higiene de manos y vacunación cuando esté indicada.',
    sourceId: 'src-oficial',
    relatedReportCategories: ['riesgo_ambiental'],
    isDemo: true,
  },
  {
    id: 'leptospirosis',
    name: 'Leptospirosis',
    category: 'otra',
    description: 'Infección bacteriana asociada a contacto con agua o suelo contaminados, más frecuente tras inundaciones.',
    prevention: 'Evitar contacto con agua de inundación, usar calzado protector y controlar roedores.',
    sourceId: 'src-oficial',
    relatedReportCategories: ['riesgo_ambiental'],
    isDemo: true,
  },
];

export const diseaseById = (id: string): Disease | undefined => diseases.find((d) => d.id === id);

/**
 * Perfil base semanal por enfermedad (media por zona) y tendencia DEMO.
 * `trend` multiplica las últimas semanas para generar escenarios que
 * ejercitan el cálculo de señales sin representar datos reales.
 */
const profiles: Record<string, { base: number; trend: number[]; hotspots?: string[] }> = {
  dengue: { base: 4, trend: [1, 1, 1.05, 1.1, 1, 1.05, 1.1, 1.15, 1.25, 1.45, 1.7, 1.9], hotspots: ['poniente', 'noroeste'] },
  chikungunya: { base: 0.8, trend: Array<number>(12).fill(1) },
  zika: { base: 0.5, trend: Array<number>(12).fill(1) },
  influenza: { base: 6, trend: [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25] },
  covid19: { base: 3, trend: [1.2, 1.15, 1.1, 1.05, 1, 1, 0.95, 0.95, 0.9, 0.9, 0.9, 0.85] },
  sarampion: { base: 0.1, trend: Array<number>(12).fill(1) },
  tosferina: { base: 0.3, trend: Array<number>(12).fill(1) },
  eda: { base: 9, trend: [1.1, 1.05, 1.1, 1, 1, 0.95, 1, 1, 0.95, 1, 1.05, 1] },
  'hepatitis-a': { base: 0.6, trend: Array<number>(12).fill(1) },
  leptospirosis: { base: 0.4, trend: [1, 1, 1.2, 1.4, 1.2, 1, 1, 0.9, 0.9, 1, 1, 1] },
};

function buildAggregatedCases(): AggregatedCase[] {
  const rows: AggregatedCase[] = [];
  for (const disease of diseases) {
    const profile = profiles[disease.id] ?? { base: 1, trend: Array<number>(12).fill(1) };
    for (const region of regions) {
      const rng = createRng(hashString(`${disease.id}:${region.id}`));
      const popFactor = region.estimatedPopulation / 120000;
      DEMO_WEEKS.forEach((week, i) => {
        const hotspotBoost = profile.hotspots?.includes(region.id) && i >= 8 ? 1 + (i - 7) * 0.18 : 1;
        const expected = profile.base * popFactor * (profile.trend[i] ?? 1) * hotspotBoost;
        const noise = 0.75 + rng() * 0.5;
        rows.push({
          regionId: region.id,
          diseaseId: disease.id,
          week,
          count: Math.max(0, Math.round(expected * noise)),
          source: 'oficial-demo',
          isDemo: true,
        });
      });
    }
  }
  return rows;
}

export const aggregatedCases: AggregatedCase[] = buildAggregatedCases();

function buildVectorRecords(): VectorRecord[] {
  const rows: VectorRecord[] = [];
  const baseByRegion: Record<string, number> = {
    centro: 22,
    norte: 28,
    noroeste: 34,
    poniente: 38,
    sureste: 26,
    sur: 31,
    hotelera: 12,
  };
  for (const region of regions) {
    const rng = createRng(hashString(`vector:${region.id}`));
    DEMO_WEEKS.forEach((week, i) => {
      // Muestreo parcial: algunas semanas sin inspección en zonas pequeñas.
      if (region.id === 'hotelera' && i % 3 === 1) return;
      const seasonal = 1 + Math.sin((i / 11) * Math.PI) * 0.25;
      const positivity = Math.min(95, Math.round((baseByRegion[region.id] ?? 25) * seasonal * (0.85 + rng() * 0.3)));
      rows.push({
        regionId: region.id,
        week,
        ovitrapPositivity: positivity,
        trapsInspected: 20 + Math.round(rng() * 25),
        sourceId: 'src-vector',
        isDemo: true,
      });
    });
  }
  return rows;
}

export const vectorRecords: VectorRecord[] = buildVectorRecords();
