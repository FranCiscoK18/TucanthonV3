/**
 * Brigadas de vacunación y campañas preventivas (DEMO). Las fechas son relativas a hoy
 * para que la agenda siempre tenga actividades próximas. Las sedes son referencias
 * genéricas de espacios públicos: no acudas a ellas, son eventos ficticios.
 */
import type { ActivityStatus, CareModality, HealthActivity, LngLat, RegionId, TargetPopulation } from '../types';
import { addDays } from '../utils/dates';
import { getDemoClock } from './clock';
import { regionById } from './regions';

export const targetPopulationLabels: Record<TargetPopulation, string> = {
  ninez: 'Niñas y niños',
  adolescentes: 'Adolescentes',
  'personas-adultas': 'Personas adultas',
  'personas-mayores': 'Personas mayores',
  embarazadas: 'Personas embarazadas',
  'poblacion-general': 'Población general',
};

export const activityStatusLabels: Record<ActivityStatus, string> = {
  programada: 'Programada',
  'en-curso': 'En curso hoy',
  finalizada: 'Finalizada',
  reprogramada: 'Reprogramada',
};

export const modalityLabels: Record<CareModality, string> = {
  presencial: 'Presencial',
  'en-linea': 'En línea',
};

const SOURCE = 'fuente-agenda-brigadas';

interface ActivitySeed {
  id: string;
  kind: 'brigada' | 'campana';
  title: string;
  detail: string;
  diseaseIds: string[];
  regionId: RegionId;
  dayOffset: number;
  startTime: string;
  endTime: string;
  targets: TargetPopulation[];
  requirements: string[];
  venueHint: string;
  status: ActivityStatus;
  organizer: string;
  description: string;
}

const seeds: ActivitySeed[] = [
  {
    id: 'brigada-influenza-centro',
    kind: 'brigada',
    title: 'Vacunación contra influenza estacional',
    detail: 'Influenza estacional',
    diseaseIds: ['influenza'],
    regionId: 'centro',
    dayOffset: 2,
    startTime: '09:00',
    endTime: '14:00',
    targets: ['personas-mayores', 'embarazadas', 'poblacion-general'],
    requirements: ['Cartilla de vacunación, si la tienes', 'Si tienes síntomas respiratorios, usa cubrebocas'],
    venueHint: 'Explanada pública de la zona Centro (referencia general)',
    status: 'programada',
    organizer: 'Jurisdicción sanitaria (referencia)',
    description: 'Aplicación de la vacuna estacional para grupos prioritarios y población general.',
  },
  {
    id: 'brigada-covid-sur',
    kind: 'brigada',
    title: 'Refuerzo de COVID-19',
    detail: 'COVID-19 (refuerzo según esquema vigente)',
    diseaseIds: ['covid-19'],
    regionId: 'sur',
    dayOffset: 1,
    startTime: '10:00',
    endTime: '15:00',
    targets: ['personas-mayores', 'personas-adultas'],
    requirements: ['Identificación o cartilla de vacunación, si la tienes'],
    venueHint: 'Parque público de la zona Sur (referencia general)',
    status: 'programada',
    organizer: 'Jurisdicción sanitaria (referencia)',
    description: 'Dosis de refuerzo para personas que cumplen los criterios del esquema vigente.',
  },
  {
    id: 'brigada-influenza-bonfil',
    kind: 'brigada',
    title: 'Vacunación contra influenza en módulo itinerante',
    detail: 'Influenza estacional',
    diseaseIds: ['influenza'],
    regionId: 'bonfil',
    dayOffset: 0,
    startTime: '08:00',
    endTime: '16:00',
    targets: ['poblacion-general'],
    requirements: ['Cartilla de vacunación, si la tienes'],
    venueHint: 'Módulo itinerante en un espacio público de la zona (referencia general)',
    status: 'en-curso',
    organizer: 'Jurisdicción sanitaria (referencia)',
    description: 'Módulo móvil de vacunación durante la jornada.',
  },
  {
    id: 'brigada-srp-noroeste',
    kind: 'brigada',
    title: 'Puesta al día del esquema SRP',
    detail: 'SRP (sarampión, rubéola y parotiditis)',
    diseaseIds: ['sarampion'],
    regionId: 'noroeste',
    dayOffset: 4,
    startTime: '08:30',
    endTime: '13:30',
    targets: ['ninez', 'adolescentes'],
    requirements: ['Cartilla de vacunación', 'Las personas menores de edad deben ir acompañadas por una persona adulta'],
    venueHint: 'Módulo itinerante en un espacio público de la zona (referencia general)',
    status: 'programada',
    organizer: 'Jurisdicción sanitaria (referencia)',
    description: 'Revisión de cartillas y aplicación de dosis pendientes de SRP.',
  },
  {
    id: 'brigada-tdpa-norte',
    kind: 'brigada',
    title: 'Vacunación Tdpa durante el embarazo',
    detail: 'Tdpa (tétanos, difteria y tos ferina)',
    diseaseIds: ['tos-ferina'],
    regionId: 'norte',
    dayOffset: 6,
    startTime: '09:00',
    endTime: '12:00',
    targets: ['embarazadas'],
    requirements: ['Cartilla de vacunación o carnet perinatal, si lo tienes'],
    venueHint: 'Centro de salud público de la zona (referencia general)',
    status: 'programada',
    organizer: 'Jurisdicción sanitaria (referencia)',
    description: 'Vacuna recomendada durante el embarazo para proteger a recién nacidos.',
  },
  {
    id: 'brigada-infantil-poniente',
    kind: 'brigada',
    title: 'Esquema básico de vacunación infantil',
    detail: 'Hepatitis A, SRP y otras del esquema básico',
    diseaseIds: ['hepatitis-a', 'sarampion'],
    regionId: 'poniente',
    dayOffset: 9,
    startTime: '09:00',
    endTime: '13:00',
    targets: ['ninez'],
    requirements: ['Cartilla de vacunación', 'Acompañamiento de una persona adulta'],
    venueHint: 'Espacio público de la zona Poniente (referencia general)',
    status: 'reprogramada',
    organizer: 'Jurisdicción sanitaria (referencia)',
    description: 'Jornada reprogramada por condiciones del clima.',
  },
  {
    id: 'brigada-influenza-zh',
    kind: 'brigada',
    title: 'Vacunación para personas trabajadoras del sector turístico',
    detail: 'Influenza estacional',
    diseaseIds: ['influenza'],
    regionId: 'zona-hotelera',
    dayOffset: -3,
    startTime: '07:00',
    endTime: '11:00',
    targets: ['personas-adultas'],
    requirements: ['Identificación laboral o cartilla, si la tienes'],
    venueHint: 'Espacio público de la Zona Hotelera (referencia general)',
    status: 'finalizada',
    organizer: 'Jurisdicción sanitaria (referencia)',
    description: 'Jornada finalizada.',
  },
  {
    id: 'campana-criaderos-sur',
    kind: 'campana',
    title: 'Jornada comunitaria de eliminación de criaderos',
    detail: 'Retiro de recipientes que acumulan agua',
    diseaseIds: ['dengue', 'chikungunya', 'zika'],
    regionId: 'sur',
    dayOffset: 3,
    startTime: '08:00',
    endTime: '12:00',
    targets: ['poblacion-general'],
    requirements: ['Ropa cómoda y calzado cerrado', 'Guantes, si los tienes'],
    venueHint: 'Punto de reunión en un parque público de la zona (referencia general)',
    status: 'programada',
    organizer: 'Gobierno municipal y aliados comunitarios (referencia)',
    description: 'Recorrido vecinal para retirar llantas, cubetas y otros recipientes que acumulan agua.',
  },
  {
    id: 'campana-criaderos-poniente',
    kind: 'campana',
    title: 'Patio limpio: revisión de recipientes en casa',
    detail: 'Orientación para revisar patios y azoteas',
    diseaseIds: ['dengue', 'chikungunya'],
    regionId: 'poniente',
    dayOffset: 5,
    startTime: '16:00',
    endTime: '19:00',
    targets: ['poblacion-general'],
    requirements: ['Sin requisitos'],
    venueHint: 'Explanada pública de la zona Poniente (referencia general)',
    status: 'programada',
    organizer: 'Gobierno municipal (referencia)',
    description: 'Taller breve con una lista de verificación para el hogar.',
  },
  {
    id: 'campana-agua-bonfil',
    kind: 'campana',
    title: 'Agua segura y lavado de manos',
    detail: 'Prevención de enfermedades entéricas',
    diseaseIds: ['eda', 'hepatitis-a'],
    regionId: 'bonfil',
    dayOffset: 7,
    startTime: '10:00',
    endTime: '12:00',
    targets: ['ninez', 'poblacion-general'],
    requirements: ['Sin requisitos'],
    venueHint: 'Espacio público de la zona Bonfil (referencia general)',
    status: 'programada',
    organizer: 'Jurisdicción sanitaria y aliados comunitarios (referencia)',
    description: 'Demostraciones sobre desinfección de agua y manejo de alimentos.',
  },
  {
    id: 'campana-respiratorias-noroeste',
    kind: 'campana',
    title: 'Plática sobre infecciones respiratorias en temporada fría',
    detail: 'Prevención de infecciones respiratorias',
    diseaseIds: ['ira', 'influenza'],
    regionId: 'noroeste',
    dayOffset: 10,
    startTime: '17:00',
    endTime: '18:30',
    targets: ['personas-adultas', 'personas-mayores'],
    requirements: ['Sin requisitos'],
    venueHint: 'Espacio comunitario público de la zona (referencia general)',
    status: 'programada',
    organizer: 'Aliados comunitarios (referencia)',
    description: 'Orientación general sobre medidas de prevención y cuándo buscar atención médica.',
  },
  {
    id: 'campana-repelente-zh',
    kind: 'campana',
    title: 'Orientación sobre repelente y protección personal',
    detail: 'Prevención de picaduras de mosquito',
    diseaseIds: ['dengue'],
    regionId: 'zona-hotelera',
    dayOffset: 12,
    startTime: '15:00',
    endTime: '17:00',
    targets: ['personas-adultas'],
    requirements: ['Sin requisitos'],
    venueHint: 'Espacio público de la Zona Hotelera (referencia general)',
    status: 'programada',
    organizer: 'Gobierno municipal (referencia)',
    description: 'Información para personas trabajadoras que pasan muchas horas al aire libre.',
  },
  {
    id: 'campana-calor-centro',
    kind: 'campana',
    title: 'Hidratación y trabajo al aire libre',
    detail: 'Prevención de afecciones por calor',
    diseaseIds: ['calor'],
    regionId: 'centro',
    dayOffset: -6,
    startTime: '10:00',
    endTime: '12:00',
    targets: ['personas-adultas'],
    requirements: ['Sin requisitos'],
    venueHint: 'Explanada pública de la zona Centro (referencia general)',
    status: 'finalizada',
    organizer: 'Gobierno municipal (referencia)',
    description: 'Jornada finalizada.',
  },
];

/**
 * Punto aproximado (≈100 m de precisión) cerca del ancla de actividades de la zona.
 * Si una zona tiene varias actividades, se reparten en horizontal para que no se encimen.
 */
function approximatePoint(regionId: RegionId, id: string): LngLat {
  const anchor = regionById.get(regionId)?.activityAnchor ?? [-86.85, 21.15];
  const siblings = seeds.filter((seed) => seed.regionId === regionId).map((seed) => seed.id);
  const index = Math.max(0, siblings.indexOf(id));
  const spread = (index - (siblings.length - 1) / 2) * 0.02;
  const lng = Math.round((anchor[0] + spread) * 1000) / 1000;
  const lat = Math.round(anchor[1] * 1000) / 1000;
  return [lng, lat];
}

let cache: HealthActivity[] | null = null;

export function getActivitiesMock(): HealthActivity[] {
  if (cache) return cache;
  const { today } = getDemoClock();
  cache = seeds.map((seed): HealthActivity => {
    const base = {
      id: seed.id,
      title: seed.title,
      diseaseIds: seed.diseaseIds,
      regionId: seed.regionId,
      venueHint: seed.venueHint,
      approxPoint: approximatePoint(seed.regionId, seed.id),
      date: addDays(today, seed.dayOffset),
      startTime: seed.startTime,
      endTime: seed.endTime,
      targetPopulations: seed.targets,
      requirements: seed.requirements,
      status: seed.status,
      organizer: seed.organizer,
      sourceId: SOURCE,
      description: seed.description,
      isDemo: true as const,
    };
    return seed.kind === 'brigada'
      ? { ...base, type: 'brigada-vacunacion', vaccines: [seed.detail] }
      : { ...base, type: 'campana-preventiva', topic: seed.detail };
  });
  return cache;
}
