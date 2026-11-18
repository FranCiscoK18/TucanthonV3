/**
 * Avisos informativos DEMO. Cada aviso declara fuente, fecha, criterio y limitación.
 * Nunca usan lenguaje de alarma ni afirman la existencia de brotes.
 */
import { SIGNAL_CRITERIA } from '../config/demo';
import { TEXTS } from '../config/texts';
import { getDemoClock } from '../mocks/clock';
import { diseases } from '../mocks/diseases';
import { regionName } from '../mocks/regions';
import type { Alert } from '../types';
import { addDays, isoToCancunDate } from '../utils/dates';
import { formatDecimal } from '../utils/format';
import { simulateRequest } from './client';
import { signalFor, weeksForPeriod } from './epidemiologyService';
import { getAllReportsSnapshot } from './reportService';

function signalAlerts(): Alert[] {
  const { cutoff } = getDemoClock();
  const { windowWeeks, baselineWeeks, thresholdRatio, minObservations } = SIGNAL_CRITERIA;
  return diseases
    .map((disease) => ({ disease, signal: signalFor(disease.id) }))
    .filter(({ signal }) => signal.status === 'senal')
    .map(({ disease, signal }) => ({
      id: `aviso-senal-${disease.id}`,
      title: `Variación en registros oficiales DEMO: ${disease.name}`,
      message: `En ${signal.windowLabel} se agregaron ${signal.windowTotal} registros, ${formatDecimal(signal.ratio ?? 0)} veces lo esperado según la línea base (${signal.baselineLabel}).`,
      source: 'Registro semanal de notificación (simulado)',
      sourceId: 'fuente-registro-semanal',
      date: cutoff,
      criteria: `Ventana de ${windowWeeks} semanas frente a la línea base de las ${baselineWeeks} anteriores; umbral ${formatDecimal(thresholdRatio)}×; mínimo ${minObservations} registros.`,
      limitations: `${TEXTS.signalDisclaimer} Datos simulados.`,
      level: 'seguimiento' as const,
      relatedDiseaseId: disease.id,
      isDemo: true as const,
    }));
}

function participationAlert(): Alert | null {
  const weeks = weeksForPeriod('ultimas-4');
  const firstDay = weeks[0]?.start;
  if (!firstDay) return null;
  const counts = new Map<string, number>();
  for (const report of getAllReportsSnapshot()) {
    if (isoToCancunDate(report.createdAt) < firstDay) continue;
    counts.set(report.approximateZone, (counts.get(report.approximateZone) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  return {
    id: 'aviso-participacion',
    title: `La zona ${regionName(top[0])} concentra más reportes ciudadanos`,
    message: `En las últimas 4 semanas, ${regionName(top[0])} reunió ${top[1]} reportes, la cifra más alta entre las zonas. Coincide con la presencia de códigos QR y aliados comunitarios en el escenario DEMO.`,
    source: 'Reportes ciudadanos Ondara (simulados)',
    sourceId: 'fuente-reportes',
    date: getDemoClock().today,
    criteria: 'Conteo de reportes por zona en las últimas 4 semanas, incluida la semana en curso.',
    limitations: TEXTS.participationCaveat,
    level: 'informativo',
    isDemo: true,
  };
}

function staticAlerts(): Alert[] {
  const { today } = getDemoClock();
  return [
    {
      id: 'aviso-criaderos',
      title: 'Recomendaciones generales para eliminar criaderos',
      message: 'Después de las lluvias, revisa patios, azoteas y áreas comunes, y voltea o retira los recipientes que acumulen agua.',
      source: 'Material informativo de prevención (DEMO)',
      sourceId: 'fuente-material-informativo',
      date: addDays(today, -2),
      criteria: 'Calendario estacional: se publica durante la temporada de lluvias.',
      limitations: 'Orientación general; no sustituye las indicaciones de la autoridad sanitaria.',
      level: 'informativo',
      isDemo: true,
    },
    {
      id: 'aviso-agenda',
      title: 'Agenda de brigadas y campañas actualizada',
      message: 'Se agregaron jornadas de vacunación contra influenza y una jornada comunitaria de eliminación de criaderos.',
      source: 'Agenda de brigadas y campañas (simulada)',
      sourceId: 'fuente-agenda-brigadas',
      date: addDays(today, -1),
      criteria: 'Se publica cuando cambia la agenda DEMO.',
      limitations: 'Eventos ficticios: no acudas a las sedes señaladas.',
      level: 'informativo',
      isDemo: true,
    },
  ];
}

export async function getAlerts(): Promise<Alert[]> {
  return simulateRequest(() => {
    const participation = participationAlert();
    return [...signalAlerts(), ...(participation ? [participation] : []), ...staticAlerts()];
  });
}
