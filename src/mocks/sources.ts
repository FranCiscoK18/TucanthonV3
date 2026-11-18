import type { DataSource } from '../types';
import { DEMO_CUTOFF_DATE } from '../utils/dates';

/**
 * Registro de fuentes DEMO. Ninguna corresponde a un sistema oficial real:
 * los nombres describen el TIPO de fuente que se integraría en un piloto.
 */
export const dataSources: DataSource[] = [
  {
    id: 'src-oficial',
    name: 'Agregados semanales de vigilancia (simulados)',
    type: 'oficial-demo',
    responsible: 'Área de epidemiología de la autoridad sanitaria (por definir)',
    period: 'Semanas 35 a 46 de 2026',
    cutoffDate: DEMO_CUTOFF_DATE,
    coverage: '7 zonas amplias de Cancún',
    status: 'activa',
    limitations:
      'Datos inventados con forma de agregados oficiales. No provienen de ningún sistema de vigilancia real y pueden tener retraso de notificación simulado.',
    isDemo: true,
  },
  {
    id: 'src-estimado',
    name: 'Tasa estimada por 10 000 habitantes',
    type: 'estimado',
    responsible: 'Equipo de análisis Ondara (DEMO)',
    period: 'Semanas 35 a 46 de 2026',
    cutoffDate: DEMO_CUTOFF_DATE,
    coverage: '7 zonas amplias de Cancún',
    status: 'activa',
    limitations:
      'Se calcula dividiendo los agregados DEMO entre una población estimada por zona. La población es una proyección simulada con incertidumbre; la tasa no es incidencia clínica.',
    isDemo: true,
  },
  {
    id: 'src-ciudadano',
    name: 'Reportes ciudadanos Ondara',
    type: 'ciudadano',
    responsible: 'Mesa de revisión Ondara (DEMO)',
    period: 'Últimas 12 semanas',
    cutoffDate: DEMO_CUTOFF_DATE,
    coverage: 'Depende de la participación por zona y canal',
    status: 'activa',
    limitations:
      'Observaciones sin verificar. Más reportes pueden reflejar más participación, no más riesgo. No son casos clínicos.',
    isDemo: true,
  },
  {
    id: 'src-vector',
    name: 'Muestreo entomológico por ovitrampas (simulado)',
    type: 'entomologico-demo',
    responsible: 'Área de control de vectores (por definir)',
    period: 'Semanas 35 a 46 de 2026',
    cutoffDate: DEMO_CUTOFF_DATE,
    coverage: 'Muestreo parcial; no todas las zonas se inspeccionan cada semana',
    status: 'en_validacion',
    limitations:
      'Índice simulado de ovitrampas positivas. Indica presencia de huevos de mosquito en trampas, no transmisión de enfermedad.',
    isDemo: true,
  },
  {
    id: 'src-campanas',
    name: 'Calendario de brigadas y campañas (simulado)',
    type: 'campanas-demo',
    responsible: 'Área de promoción de la salud (por definir)',
    period: 'Noviembre y diciembre de 2026',
    cutoffDate: DEMO_CUTOFF_DATE,
    coverage: 'Actividades de ejemplo en zonas amplias',
    status: 'activa',
    limitations: 'Fechas y sedes ficticias. No acudir: no son jornadas convocadas.',
    isDemo: true,
  },
];

export const sourceById = (id: string): DataSource | undefined => dataSources.find((s) => s.id === id);
