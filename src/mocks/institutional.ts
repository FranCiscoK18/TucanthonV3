import type { Indicator, PilotQuestion, PilotStage, PriorityZone, RegulationItem } from '../types';

/**
 * Métricas primarias del piloto (utilidad, oportunidad, seguimiento,
 * cobertura, sostenibilidad). Valores DEMO. Ninguna mide efecto clínico.
 */
export const indicators: Indicator[] = [
  {
    id: 'ind-utilidad',
    dimension: 'utilidad',
    name: 'Reportes útiles',
    value: 62,
    unit: '%',
    target: 'Meta de piloto por definir con la autoridad',
    definition: 'Proporción de reportes completos, pertinentes y no duplicados sobre el total recibido.',
    note: 'Mide la calidad de la observación, no su relación con casos clínicos.',
    trend: [48, 51, 55, 54, 58, 60, 61, 62],
    isDemo: true,
  },
  {
    id: 'ind-oportunidad-revision',
    dimension: 'oportunidad',
    name: 'Recepción → revisión',
    value: 19,
    unit: 'h (mediana)',
    definition: 'Mediana de horas entre la recepción del reporte y su primera revisión.',
    note: 'Depende de la capacidad de la mesa de revisión; no indica velocidad de respuesta sanitaria.',
    trend: [34, 31, 28, 26, 24, 22, 20, 19],
    isDemo: true,
  },
  {
    id: 'ind-oportunidad-canalizacion',
    dimension: 'oportunidad',
    name: 'Revisión → canalización',
    value: 27,
    unit: 'h (mediana)',
    definition: 'Mediana de horas entre la revisión y el envío al área responsable.',
    note: 'La canalización no implica que la autoridad haya aceptado actuar.',
    trend: [41, 39, 36, 33, 31, 30, 28, 27],
    isDemo: true,
  },
  {
    id: 'ind-seguimiento',
    dimension: 'seguimiento',
    name: 'Con responsable y cierre documentado',
    value: 71,
    unit: '%',
    definition: 'Proporción de reportes canalizados con responsable asignado y cierre documentado.',
    note: 'El cierre registra qué pasó con la observación; no es evidencia de reducción de enfermedades.',
    trend: [52, 55, 59, 63, 66, 68, 70, 71],
    isDemo: true,
  },
  {
    id: 'ind-cobertura',
    dimension: 'cobertura',
    name: 'Zonas con participación activa',
    value: 6,
    unit: 'de 7 zonas',
    definition: 'Zonas con al menos 5 reportes en las últimas 4 semanas, desglosado por canal.',
    note: 'Sesgo de selección: participan más quienes conocen el canal y tienen conectividad. Las zonas con pocos reportes no son zonas sin riesgo.',
    trend: [3, 4, 4, 5, 5, 6, 6, 6],
    isDemo: true,
  },
  {
    id: 'ind-sostenibilidad',
    dimension: 'sostenibilidad',
    name: 'Costo por reporte útil',
    value: 184,
    unit: 'MXN',
    definition: 'Costo operativo DEMO del periodo dividido entre el número de reportes útiles.',
    note: 'Costo simulado. No incluye cobros a ciudadanía (no existen) ni comisiones (no existen).',
    trend: [310, 280, 255, 232, 214, 201, 190, 184],
    isDemo: true,
  },
];

export const dimensionLabels: Record<Indicator['dimension'], string> = {
  utilidad: 'Utilidad',
  oportunidad: 'Oportunidad',
  seguimiento: 'Seguimiento',
  cobertura: 'Cobertura',
  sostenibilidad: 'Sostenibilidad',
};

/** Zonas prioritarias SUGERIDAS para revisión. La prioridad la define la autoridad. */
export const priorityZones: PriorityZone[] = [
  {
    regionId: 'poniente',
    score: 0.82,
    reasons: [
      'Agregados DEMO de dengue por encima de su línea base en 2 semanas.',
      'Índice simulado de ovitrampas positivas en el tercio superior.',
      'Reportes de posibles criaderos revisados como útiles en aumento.',
    ],
    isDemo: true,
  },
  {
    regionId: 'noroeste',
    score: 0.71,
    reasons: ['Más reportes de posibles criaderos (puede reflejar mayor participación).', 'Índice simulado de ovitrampas elevado.'],
    isDemo: true,
  },
  {
    regionId: 'sur',
    score: 0.48,
    reasons: ['Baja participación ciudadana: falta de datos, no ausencia de riesgo.', 'Muestreo vectorial simulado incompleto.'],
    isDemo: true,
  },
];

export const pilotStages: PilotStage[] = [
  {
    id: 'pil-1',
    name: 'Preparación',
    days: 'Días 1–15',
    status: 'completada',
    activities: [
      'Acuerdo de colaboración y roles con la autoridad sanitaria',
      'Definición de zonas piloto y criterios de revisión',
      'Revisión jurídica de privacidad y aviso de privacidad',
    ],
    deliverable: 'Protocolo de operación y aviso de privacidad aprobados',
    isDemo: true,
  },
  {
    id: 'pil-2',
    name: 'Despliegue',
    days: 'Días 16–30',
    status: 'completada',
    activities: ['Activación del sitio móvil y códigos QR', 'Capacitación de aliados comunitarios', 'Prueba de flujo de canalización'],
    deliverable: 'Canales activos y mesa de revisión operando',
    isDemo: true,
  },
  {
    id: 'pil-3',
    name: 'Operación',
    days: 'Días 31–75',
    status: 'en_curso',
    activities: ['Recepción, revisión y canalización de reportes', 'Medición semanal de las cinco métricas', 'Ajustes de criterios con la autoridad'],
    deliverable: 'Tablero de métricas y bitácora de canalizaciones',
    isDemo: true,
  },
  {
    id: 'pil-4',
    name: 'Cierre',
    days: 'Días 76–90',
    status: 'pendiente',
    activities: ['Evaluación con las cinco preguntas de decisión', 'Informe de limitaciones y sesgos', 'Decisión de continuar, ajustar o detener'],
    deliverable: 'Informe de cierre y recomendación',
    isDemo: true,
  },
];

/**
 * Preguntas de decisión del piloto, alineadas a las métricas primarias.
 * Validar la redacción final con el documento conceptual.
 */
export const pilotQuestions: PilotQuestion[] = [
  {
    id: 'q-1',
    dimension: 'utilidad',
    question: '¿Una proporción suficiente de reportes fue completa, pertinente y no duplicada?',
    evidence: '% de reportes útiles y motivos de descarte',
    isDemo: true,
  },
  {
    id: 'q-2',
    dimension: 'oportunidad',
    question: '¿Los reportes se revisaron y canalizaron en tiempos que la autoridad considera útiles?',
    evidence: 'Medianas recepción → revisión y revisión → canalización',
    isDemo: true,
  },
  {
    id: 'q-3',
    dimension: 'seguimiento',
    question: '¿Los reportes canalizados tuvieron responsable asignado y cierre documentado?',
    evidence: '% con responsable y cierre; bitácora',
    isDemo: true,
  },
  {
    id: 'q-4',
    dimension: 'cobertura',
    question: '¿La participación llegó a zonas y canales más allá de los grupos ya conectados?',
    evidence: 'Participación por zona y canal, con análisis de sesgo de selección',
    isDemo: true,
  },
  {
    id: 'q-5',
    dimension: 'sostenibilidad',
    question: '¿El costo por reporte útil permite continuar sin cobrar a la ciudadanía ni depender de comisiones?',
    evidence: 'Costo por reporte útil y fuentes de financiamiento',
    isDemo: true,
  },
];

export const regulations: RegulationItem[] = [
  {
    id: 'reg-1',
    name: 'NOM-017-SSA2-2012, para la vigilancia epidemiológica',
    scope: 'Federal',
    relevance: 'Define el sistema de vigilancia epidemiológica y quién notifica y confirma casos.',
    pendingReview: 'Confirmar que los reportes ciudadanos se presenten como complementarios y nunca como notificación oficial.',
    isDemo: true,
  },
  {
    id: 'reg-2',
    name: 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares (2025)',
    scope: 'Federal',
    relevance: 'Aplica si un particular opera la plataforma y trata datos personales.',
    pendingReview: 'Aviso de privacidad, minimización de datos y tratamiento de datos sensibles de salud.',
    isDemo: true,
  },
  {
    id: 'reg-3',
    name: 'Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (2025)',
    scope: 'Federal',
    relevance: 'Aplica si una autoridad opera o recibe los datos.',
    pendingReview: 'Definir responsable y encargado del tratamiento, y transferencias entre módulos.',
    isDemo: true,
  },
  {
    id: 'reg-4',
    name: 'Ley de protección de datos personales en posesión de sujetos obligados de Quintana Roo',
    scope: 'Estatal',
    relevance: 'Aplica a autoridades estatales y municipales de Quintana Roo.',
    pendingReview: 'Verificar la versión vigente y obligaciones locales.',
    isDemo: true,
  },
  {
    id: 'reg-5',
    name: 'Ley de Adquisiciones, Arrendamientos y Servicios del Sector Público (2025)',
    scope: 'Federal',
    relevance: 'Aplica si el servicio se contrata con recursos federales.',
    pendingReview: 'Modalidad de contratación del piloto. No se presupone subsidio ni adjudicación.',
    isDemo: true,
  },
  {
    id: 'reg-6',
    name: 'Normativa estatal o municipal aplicable',
    scope: 'Estatal / municipal',
    relevance: 'Adquisiciones, salud y protección civil locales.',
    pendingReview: 'Identificar reglamentos de Benito Juárez y Quintana Roo aplicables al piloto.',
    isDemo: true,
  },
];
