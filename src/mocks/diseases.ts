/**
 * Catálogo DEMO de enfermedades y señales. Las descripciones son generales e
 * informativas; no sirven para diagnosticar ni sustituyen la orientación médica.
 */
import type { Disease, DiseaseCategory } from '../types';

export const categoryLabels: Record<DiseaseCategory, string> = {
  'viral-respiratoria': 'Viral respiratoria',
  'transmitida-por-vector': 'Transmitida por vector',
  'prevenible-por-vacunacion': 'Prevenible por vacunación',
  enterica: 'Entérica',
  otra: 'Otra',
};

export const categoryOrder: DiseaseCategory[] = [
  'transmitida-por-vector',
  'viral-respiratoria',
  'prevenible-por-vacunacion',
  'enterica',
  'otra',
];

const OFFICIAL_SOURCE = 'fuente-registro-semanal';
const BASE_MONITORING =
  'Se visualiza mediante conteos semanales por zona.';

export const diseases: Disease[] = [
  {
    id: 'dengue',
    name: 'Dengue',
    shortName: 'Dengue',
    kind: 'enfermedad',
    category: 'transmitida-por-vector',
    summary: 'Infección viral transmitida por mosquitos Aedes.',
    description:
      'Infección viral transmitida por la picadura de mosquitos Aedes aegypti infectados. Puede causar fiebre y malestar general; algunas personas desarrollan formas graves que requieren atención médica oportuna.',
    monitoring: `${BASE_MONITORING} Se complementa con la capa entomológica de ovitrampas.`,
    prevention:
      'Eliminar recipientes que acumulen agua, usar repelente y mosquiteros, y seguir las indicaciones de la autoridad sanitaria.',
    sourceId: OFFICIAL_SOURCE,
    hasVectorData: true,
    isDemo: true,
  },
  {
    id: 'chikungunya',
    name: 'Chikungunya',
    shortName: 'Chikungunya',
    kind: 'enfermedad',
    category: 'transmitida-por-vector',
    summary: 'Infección viral transmitida por mosquitos Aedes.',
    description:
      'Infección viral transmitida por mosquitos Aedes. Suele causar fiebre y dolor en las articulaciones, que en algunas personas se prolonga por semanas.',
    monitoring: `${BASE_MONITORING} Se complementa con la capa entomológica de ovitrampas.`,
    prevention: 'Las mismas medidas que para el dengue: eliminar criaderos, usar repelente y proteger ventanas y camas.',
    sourceId: OFFICIAL_SOURCE,
    hasVectorData: true,
    isDemo: true,
  },
  {
    id: 'zika',
    name: 'Zika',
    shortName: 'Zika',
    kind: 'enfermedad',
    category: 'transmitida-por-vector',
    summary: 'Infección viral transmitida principalmente por mosquitos Aedes.',
    description:
      'Infección viral transmitida principalmente por mosquitos Aedes; también puede transmitirse durante el embarazo y por vía sexual. Muchas infecciones no presentan síntomas.',
    monitoring: `${BASE_MONITORING} Con conteos bajos, la regla de señal suele marcar «datos insuficientes».`,
    prevention: 'Eliminar criaderos, usar repelente y, durante el embarazo, seguir la orientación del personal de salud.',
    sourceId: OFFICIAL_SOURCE,
    hasVectorData: true,
    isDemo: true,
  },
  {
    id: 'influenza',
    name: 'Influenza',
    shortName: 'Influenza',
    kind: 'enfermedad',
    category: 'viral-respiratoria',
    summary: 'Infección respiratoria viral estacional.',
    description:
      'Infección respiratoria viral que aumenta de forma estacional en los meses fríos. La vacunación anual es una de las principales medidas de prevención.',
    monitoring: BASE_MONITORING,
    prevention: 'Vacunación anual, lavado de manos, cubrirse al toser y quedarse en casa ante síntomas respiratorios.',
    sourceId: OFFICIAL_SOURCE,
    hasVectorData: false,
    isDemo: true,
  },
  {
    id: 'covid-19',
    name: 'COVID-19',
    shortName: 'COVID-19',
    kind: 'enfermedad',
    category: 'viral-respiratoria',
    summary: 'Enfermedad respiratoria causada por el virus SARS-CoV-2.',
    description:
      'Enfermedad respiratoria causada por el virus SARS-CoV-2. Sus manifestaciones van desde cuadros leves hasta formas que requieren atención hospitalaria.',
    monitoring: BASE_MONITORING,
    prevention: 'Vacunación según el esquema vigente, ventilación de espacios y aislamiento ante síntomas.',
    sourceId: OFFICIAL_SOURCE,
    hasVectorData: false,
    isDemo: true,
  },
  {
    id: 'ira',
    name: 'Infecciones respiratorias agudas (IRA)',
    shortName: 'IRA',
    kind: 'senal',
    category: 'viral-respiratoria',
    summary: 'Señal sindrómica que agrupa infecciones respiratorias de corta duración.',
    description:
      'Agrupa infecciones de vías respiratorias de corta duración, como resfriado común o faringitis, de distintas causas. Se usa como señal sindrómica: describe tendencias, no causas.',
    monitoring: `${BASE_MONITORING} Por su volumen alto, cambios pequeños pueden ser solo variación habitual.`,
    prevention: 'Lavado de manos, ventilación y cubrirse al toser o estornudar.',
    sourceId: OFFICIAL_SOURCE,
    hasVectorData: false,
    isDemo: true,
  },
  {
    id: 'sarampion',
    name: 'Sarampión',
    shortName: 'Sarampión',
    kind: 'enfermedad',
    category: 'prevenible-por-vacunacion',
    summary: 'Enfermedad viral muy contagiosa, prevenible con vacuna.',
    description:
      'Enfermedad viral muy contagiosa, prevenible con la vacuna SRP (sarampión, rubéola y parotiditis). Revisar la cartilla de vacunación es la principal medida preventiva.',
    monitoring: `${BASE_MONITORING} Con conteos muy bajos la regla de señal no se evalúa.`,
    prevention: 'Completar el esquema de vacunación indicado por la autoridad sanitaria.',
    sourceId: OFFICIAL_SOURCE,
    hasVectorData: false,
    isDemo: true,
  },
  {
    id: 'tos-ferina',
    name: 'Tos ferina',
    shortName: 'Tos ferina',
    kind: 'enfermedad',
    category: 'prevenible-por-vacunacion',
    summary: 'Infección respiratoria bacteriana, prevenible por vacunación.',
    description:
      'Infección respiratoria causada por la bacteria Bordetella pertussis. Es prevenible por vacunación y especialmente delicada en lactantes.',
    monitoring: `${BASE_MONITORING} Con conteos bajos la regla de señal suele marcar «datos insuficientes».`,
    prevention: 'Vacunación en la infancia y durante el embarazo, según el esquema vigente.',
    sourceId: OFFICIAL_SOURCE,
    hasVectorData: false,
    isDemo: true,
  },
  {
    id: 'eda',
    name: 'Enfermedades diarreicas agudas (EDA)',
    shortName: 'EDA',
    kind: 'senal',
    category: 'enterica',
    summary: 'Señal sindrómica relacionada con agua y alimentos.',
    description:
      'Agrupa episodios de diarrea de corta duración de distintas causas. Se usa como señal sindrómica relacionada con la calidad del agua y la higiene de los alimentos.',
    monitoring: BASE_MONITORING,
    prevention: 'Consumir agua segura, lavar manos y alimentos, y mantener la cadena de frío.',
    sourceId: OFFICIAL_SOURCE,
    hasVectorData: false,
    isDemo: true,
  },
  {
    id: 'hepatitis-a',
    name: 'Hepatitis A',
    shortName: 'Hepatitis A',
    kind: 'enfermedad',
    category: 'enterica',
    summary: 'Infección viral del hígado asociada a agua o alimentos contaminados.',
    description:
      'Infección viral del hígado que se transmite por agua o alimentos contaminados. Existe vacuna y la higiene es clave para prevenirla.',
    monitoring: BASE_MONITORING,
    prevention: 'Agua segura, lavado de manos y vacunación cuando la indique el personal de salud.',
    sourceId: OFFICIAL_SOURCE,
    hasVectorData: false,
    isDemo: true,
  },
  {
    id: 'calor',
    name: 'Afecciones por calor',
    shortName: 'Calor',
    kind: 'senal',
    category: 'otra',
    summary: 'Señal de atenciones relacionadas con temperaturas altas.',
    description:
      'Agrupa atenciones relacionadas con temperaturas altas, como deshidratación o golpe de calor. Es una señal ambiental útil en temporada cálida.',
    monitoring: BASE_MONITORING,
    prevention: 'Hidratarse, evitar la exposición al sol en horas de mayor calor y procurar sombra en el trabajo al aire libre.',
    sourceId: OFFICIAL_SOURCE,
    hasVectorData: false,
    isDemo: true,
  },
];

export const diseaseById = new Map(diseases.map((disease) => [disease.id, disease]));

export function diseaseName(id: string): string {
  return diseaseById.get(id)?.name ?? 'Enfermedad o señal no identificada';
}
