/**
 * Piloto de 90 días (DEMO): cuatro etapas y preguntas de decisión.
 *
 * PENDIENTE DE VALIDAR: el texto literal de las «cinco preguntas» proviene de la propuesta
 * conceptual (noviembre 2026), que no estuvo disponible al construir esta DEMO. Las preguntas
 * siguientes son una redacción provisional derivada de las cinco métricas primarias y están
 * marcadas con `provisional: true` hasta sustituirlas por las del documento.
 */
import type { PilotQuestion, PilotStage } from '../types';

export const pilotStages: PilotStage[] = [
  {
    id: 'preparacion',
    name: 'Preparación',
    startDay: 1,
    endDay: 20,
    objective: 'Acordar alcance, reglas y responsables con la autoridad antes de recibir reportes.',
    activities: [
      'Acuerdo de roles con la autoridad sanitaria y el gobierno municipal',
      'Aviso de privacidad y reglas de retención y eliminación',
      'Criterios públicos de moderación y canalización',
      'Capacitación de aliados comunitarios',
    ],
    deliverables: ['Protocolo de operación', 'Aviso de privacidad', 'Lista de instancias responsables'],
    status: 'completada',
    isDemo: true,
  },
  {
    id: 'despliegue',
    name: 'Despliegue',
    startDay: 21,
    endDay: 35,
    objective: 'Activar los canales en las zonas piloto y probar el flujo completo.',
    activities: [
      'Instalación de códigos QR en espacios públicos',
      'Activación del sitio móvil sin descarga ni cuenta',
      'Prueba del flujo de captación a seguimiento con reportes ficticios',
    ],
    deliverables: ['Canales activos', 'Informe de pruebas del flujo'],
    status: 'completada',
    isDemo: true,
  },
  {
    id: 'operacion',
    name: 'Operación',
    startDay: 36,
    endDay: 80,
    objective: 'Recibir, moderar y canalizar reportes; medir las métricas primarias cada semana.',
    activities: [
      'Moderación diaria con criterios publicados',
      'Canalización a las instancias responsables',
      'Tablero semanal de utilidad, oportunidad, seguimiento, cobertura y sostenibilidad',
      'Ajustes menores al flujo, documentados en bitácora',
    ],
    deliverables: ['Tablero semanal', 'Bitácora de decisiones'],
    status: 'en-curso',
    isDemo: true,
  },
  {
    id: 'cierre',
    name: 'Cierre',
    startDay: 81,
    endDay: 90,
    objective: 'Responder las preguntas de decisión y acordar si continuar, ajustar o detener.',
    activities: [
      'Evaluación de las métricas primarias',
      'Sesión de decisión con la autoridad',
      'Aplicación de las reglas de retención y eliminación de datos',
    ],
    deliverables: ['Informe final', 'Decisión documentada'],
    status: 'pendiente',
    isDemo: true,
  },
];

export const pilotQuestions: PilotQuestion[] = [
  {
    id: 'pregunta-utilidad',
    dimension: 'utilidad',
    question: '¿Los reportes resultaron útiles para la autoridad: completos, pertinentes y no duplicados?',
    evidence: 'Proporción de reportes útiles sobre los reportes revisados.',
    provisional: true,
    isDemo: true,
  },
  {
    id: 'pregunta-oportunidad',
    dimension: 'oportunidad',
    question: '¿La revisión y la canalización ocurrieron a tiempo para que la autoridad pudiera actuar?',
    evidence: 'Mediana de horas de recepción a revisión y de revisión a canalización.',
    provisional: true,
    isDemo: true,
  },
  {
    id: 'pregunta-seguimiento',
    dimension: 'seguimiento',
    question: '¿Cada reporte canalizado tuvo una instancia responsable y un cierre documentado?',
    evidence: 'Proporción con responsable asignado y proporción con cierre documentado.',
    provisional: true,
    isDemo: true,
  },
  {
    id: 'pregunta-cobertura',
    dimension: 'cobertura',
    question: '¿La participación llegó a las zonas y canales previstos, y entendemos sus sesgos?',
    evidence: 'Reportes por zona y por canal, con nota de sesgo de selección.',
    provisional: true,
    isDemo: true,
  },
  {
    id: 'pregunta-sostenibilidad',
    dimension: 'sostenibilidad',
    question: '¿El costo por reporte útil es sostenible sin cobrar a la ciudadanía ni depender de comisiones?',
    evidence: 'Costo operativo simulado dividido entre reportes útiles.',
    provisional: true,
    isDemo: true,
  },
];
