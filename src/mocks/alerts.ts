import type { Alert } from '../types';

/**
 * Avisos informativos DEMO. Redactados sin lenguaje de alarma: describen un
 * cambio en los datos y su límite de interpretación, nunca declaran brotes.
 */
export const alerts: Alert[] = [
  {
    id: 'al-01',
    title: 'Aumento de registros DEMO de dengue en Poniente',
    summary:
      'Los agregados simulados de las últimas dos semanas superan su línea base. Se recomienda reforzar la eliminación de criaderos.',
    level: 'seguimiento',
    source: 'Agregados semanales de vigilancia (simulados)',
    date: '2026-11-16',
    criteria: 'Suma de 2 semanas ≥ 1.5 veces el promedio de las 8 semanas previas y al menos 10 registros.',
    limitations: 'Dato simulado. Un cambio respecto a la línea base no es un diagnóstico ni la confirmación de un brote.',
    regionId: 'poniente',
    diseaseId: 'dengue',
    isDemo: true,
  },
  {
    id: 'al-02',
    title: 'Más reportes de posibles criaderos en Noroeste',
    summary: 'La mesa de revisión recibió más reportes ciudadanos de posibles criaderos que en semanas anteriores.',
    level: 'informativa',
    source: 'Reportes ciudadanos Ondara',
    date: '2026-11-15',
    criteria: 'Conteo semanal de reportes ciudadanos de la categoría "posible criadero" frente al promedio de 4 semanas.',
    limitations:
      'Más reportes pueden reflejar más participación o difusión del canal, no necesariamente más riesgo sanitario. Los reportes no son casos.',
    regionId: 'noroeste',
    isDemo: true,
  },
  {
    id: 'al-03',
    title: 'Temporada invernal: vacunación contra influenza',
    summary: 'Inició la campaña simulada de vacunación invernal. Consulta las brigadas DEMO por zona y horario.',
    level: 'informativa',
    source: 'Calendario de brigadas y campañas (simulado)',
    date: '2026-11-10',
    criteria: 'Calendario estacional de vacunación (escenario DEMO).',
    limitations: 'Fechas y sedes ficticias: no acudir a las sedes señaladas.',
    diseaseId: 'influenza',
    isDemo: true,
  },
];
