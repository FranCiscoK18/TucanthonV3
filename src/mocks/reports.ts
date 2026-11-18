/**
 * Reportes ciudadanos de ejemplo (DEMO) y etiquetas de la participación.
 * Los textos son genéricos, sin nombres, domicilios ni datos de contacto.
 * Un reporte ciudadano es una observación, no un caso clínico confirmado.
 */
import type {
  CitizenReport,
  ClosureOutcome,
  PeopleRange,
  ReportCategory,
  ReportChannel,
  ReportStatus,
  ReportStatusChange,
  SymptomKey,
} from '../types';
import { addDays, cancunLocalToIso, weekdayOf } from '../utils/dates';
import { folioForDate } from '../utils/ids';
import { createRng } from '../utils/random';
import { getDemoClock } from './clock';
import { regions } from './regions';

export const reportCategoryLabels: Record<ReportCategory, string> = {
  'posible-criadero': 'Posible criadero de mosquitos',
  'riesgo-ambiental': 'Riesgo ambiental',
  'sintomas-agregados': 'Síntomas en mi entorno (agregados)',
  otro: 'Otro',
};

export const reportCategoryHints: Record<ReportCategory, string> = {
  'posible-criadero': 'Agua estancada, llantas, cubetas, tinacos destapados u otros recipientes.',
  'riesgo-ambiental': 'Basura acumulada, drenaje tapado, encharcamientos o fauna nociva.',
  'sintomas-agregados': 'Varias personas de tu entorno con síntomas parecidos, sin identificar a nadie.',
  otro: 'Cualquier otra observación útil para la salud de tu zona.',
};

export const reportStatusLabels: Record<ReportStatus, string> = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  verificado: 'Verificado',
  canalizado: 'Canalizado',
  cerrado: 'Cerrado',
};

/** Significado público de cada estado. «Verificado» nunca significa caso confirmado. */
export const reportStatusMeaning: Record<ReportStatus, string> = {
  pendiente: 'Recibido. Aún no lo revisa el equipo de moderación.',
  en_revision: 'Moderación revisa que esté completo, sea pertinente y no esté duplicado.',
  verificado:
    'Revisado como observación útil. No significa que exista un caso confirmado ni un riesgo comprobado.',
  canalizado:
    'Se compartió de forma agregada con la instancia responsable. Decidir si actúa corresponde a esa autoridad.',
  cerrado: 'El seguimiento terminó: se documentó una respuesta, se descartó o se integró a otro reporte.',
};

export const reportStatusOrder: ReportStatus[] = ['pendiente', 'en_revision', 'verificado', 'canalizado', 'cerrado'];

export const channelLabels: Record<ReportChannel, string> = {
  'sitio-movil': 'Sitio móvil',
  'codigo-qr': 'Código QR',
  'aliado-comunitario': 'Aliado comunitario',
};

export const symptomLabels: Record<SymptomKey, string> = {
  fiebre: 'Fiebre',
  tos: 'Tos o dificultad para respirar',
  diarrea: 'Diarrea o vómito',
  sarpullido: 'Sarpullido o manchas en la piel',
  'dolor-articular': 'Dolor de articulaciones',
  otro: 'Otro síntoma',
};

export const peopleRangeLabels: Record<PeopleRange, string> = {
  '1-2': '1 o 2 personas',
  '3-5': 'De 3 a 5 personas',
  '6+': '6 o más personas',
};

export const closureOutcomeLabels: Record<ClosureOutcome, string> = {
  'atendido-por-autoridad': 'La instancia responsable documentó una atención',
  'sin-accion-documentada': 'Sin acción documentada por la instancia responsable',
  descartado: 'Descartado en moderación',
  duplicado: 'Integrado a otro reporte (duplicado)',
};

/** Instancias responsables (áreas genéricas, nunca personas). */
export const responsibleByCategory: Record<ReportCategory, string> = {
  'posible-criadero': 'Programa de control de vectores',
  'riesgo-ambiental': 'Servicios públicos municipales',
  'sintomas-agregados': 'Área de epidemiología jurisdiccional',
  otro: 'Protección civil municipal',
};

export const responsibleOptions = [...new Set(Object.values(responsibleByCategory))];

export const discardReasons = [
  'Información insuficiente para valorarlo',
  'Fuera del alcance de Ondara',
  'Duplicado de otro reporte',
  'Contenía datos personales y se descartó por privacidad',
] as const;

const COMMENTS: Record<ReportCategory, readonly string[]> = {
  'posible-criadero': [
    'Llantas acumuladas con agua de lluvia en un terreno baldío.',
    'Cubetas y botes destapados con agua estancada en un área común.',
    'Encharcamiento que no se seca desde hace varios días junto a un parque.',
    'Tinaco sin tapa en un predio que parece desocupado.',
    'Floreros y macetas con agua en un espacio público.',
  ],
  'riesgo-ambiental': [
    'Basura acumulada en una esquina desde hace una semana.',
    'Drenaje pluvial tapado: el agua se estanca cuando llueve.',
    'Restos de poda y escombro que acumulan agua.',
    'Contenedor de basura desbordado en un área de paso.',
  ],
  'sintomas-agregados': [
    'Varias personas del entorno con fiebre en los últimos días.',
    'Se comenta que hay personas con diarrea esta semana en la zona.',
    'Personas del trabajo con tos y fiebre en la misma semana.',
  ],
  otro: [
    'Fuga de agua constante que forma charcos en la vía pública.',
    'Fauna nociva vista con frecuencia en un área común.',
    'Solicitud de información sobre la siguiente brigada en la zona.',
  ],
};

const SYMPTOM_SETS: ReadonlyArray<SymptomKey[]> = [['fiebre'], ['fiebre', 'dolor-articular'], ['diarrea'], ['tos', 'fiebre'], ['sarpullido', 'fiebre']];

/** Notas públicas de cada acción de moderación. */
export function moderationNote(
  action: ReportStatusChange['action'],
  options: { reason?: string; assignedTo?: string; outcome?: ClosureOutcome } = {},
): string {
  switch (action) {
    case 'envio':
      return 'Reporte recibido por Ondara. Aún no se revisa.';
    case 'iniciar-revision':
      return 'Moderación comenzó a revisar si está completo, es pertinente y no está duplicado.';
    case 'pedir-ampliacion':
      return `Moderación pidió ampliar la información${options.reason ? `: ${options.reason}` : ''}.`;
    case 'ampliacion-recibida':
      return 'Se recibió información adicional; la revisión continúa.';
    case 'aprobar':
      return 'Revisado como observación útil. No confirma un caso ni un riesgo comprobado.';
    case 'canalizar':
      return `Compartido de forma agregada con ${options.assignedTo ?? 'la instancia responsable'}. Decidir si actúa corresponde a esa instancia.`;
    case 'cerrar':
      return options.outcome === 'atendido-por-autoridad'
        ? `La instancia responsable documentó una atención${options.reason ? `: ${options.reason}` : ''}. Ondara cierra el seguimiento.`
        : `Sin acción documentada por la instancia responsable${options.reason ? ` (${options.reason})` : ''}. Ondara cierra el seguimiento.`;
    case 'descartar':
      return `Cerrado sin canalizar${options.reason ? `: ${options.reason}` : ''}.`;
  }
}

const ZONE_PARTICIPATION: Record<string, number> = {
  centro: 1.2,
  norte: 0.9,
  noroeste: 1,
  poniente: 1.1,
  sur: 1.6,
  bonfil: 0.8,
  'zona-hotelera': 0.25,
};

const CHANNEL_WEIGHTS: Record<string, ReadonlyArray<readonly [ReportChannel, number]>> = {
  default: [
    ['sitio-movil', 60],
    ['codigo-qr', 25],
    ['aliado-comunitario', 15],
  ],
  community: [
    ['sitio-movil', 40],
    ['codigo-qr', 25],
    ['aliado-comunitario', 35],
  ],
};

/** Reportes por semana: la participación crece durante el piloto (12 semanas + semana en curso). */
const REPORTS_PER_WEEK = [4, 5, 5, 6, 7, 7, 8, 8, 9, 10, 10, 11];
const CURRENT_WEEK_REPORTS = 12;
const HOUR = 3_600_000;
const MORE_INFO_DEADLINE_HOURS = 15 * 24;

function buildSeedReports(): CitizenReport[] {
  const clock = getDemoClock();
  const rng = createRng(20_261_118);
  const now = Date.now();
  const lastTwelve = clock.weeks.slice(-12);
  const plan: Array<{ weekStart: string; maxDay: number; count: number }> = lastTwelve.map((week, index) => ({
    weekStart: week.start,
    maxDay: 6,
    count: REPORTS_PER_WEEK[index] ?? 6,
  }));
  const todayIndex = weekdayOf(clock.today);
  if (todayIndex > 0) plan.push({ weekStart: clock.currentWeek.start, maxDay: todayIndex - 1, count: CURRENT_WEEK_REPORTS });

  const zoneEntries = regions.map((region) => [region.id, ZONE_PARTICIPATION[region.id] ?? 1] as const);
  const categoryEntries: ReadonlyArray<readonly [ReportCategory, number]> = [
    ['posible-criadero', 40],
    ['riesgo-ambiental', 25],
    ['sintomas-agregados', 20],
    ['otro', 15],
  ];

  const reports: CitizenReport[] = [];
  let sequence = 0;
  for (const { weekStart, maxDay, count } of plan) {
    for (let index = 0; index < count; index += 1) {
      sequence += 1;
      const date = addDays(weekStart, rng.int(0, maxDay));
      const time = `${String(rng.int(7, 21)).padStart(2, '0')}:${String(rng.int(0, 59)).padStart(2, '0')}`;
      const createdAt = cancunLocalToIso(date, time);
      const zone = rng.weighted(zoneEntries);
      const category = rng.weighted(categoryEntries);
      const channel = rng.weighted(
        (zone === 'sur' || zone === 'bonfil' ? CHANNEL_WEIGHTS.community : CHANNEL_WEIGHTS.default) ?? [],
      );
      const report: CitizenReport = {
        id: `ejemplo-${sequence}`,
        folio: folioForDate('OND', createdAt, 1_000 + sequence * 37),
        category,
        approximateZone: zone,
        comment: rng.pick(COMMENTS[category]),
        hasSimulatedPhoto: category !== 'sintomas-agregados' && rng.chance(0.4),
        symptoms:
          category === 'sintomas-agregados'
            ? { symptoms: [...rng.pick(SYMPTOM_SETS)], peopleRange: rng.pick<PeopleRange>(['1-2', '3-5', '6+']) }
            : undefined,
        channel,
        status: 'pendiente',
        createdAt,
        history: [{ status: 'pendiente', at: createdAt, action: 'envio', note: moderationNote('envio') }],
        awaitingMoreInfo: false,
        origin: 'ejemplo',
        isDemo: true,
      };

      // Línea de tiempo simulada: cada paso solo ocurre si su fecha ya pasó.
      let cursor = Date.parse(createdAt);
      const step = (hours: number, apply: (at: string) => void): boolean => {
        cursor += hours * HOUR;
        if (cursor > now) return false;
        apply(new Date(cursor).toISOString());
        return true;
      };
      const push = (status: ReportStatus, at: string, action: ReportStatusChange['action'], note: string) => {
        report.status = status;
        report.history.push({ status, at, action, note });
      };

      if (!step(rng.float(6, 72), (at) => push('en_revision', at, 'iniciar-revision', moderationNote('iniciar-revision')))) {
        reports.push(report);
        continue;
      }
      let complete = rng.chance(0.86);
      const pertinent = rng.chance(0.84);
      const duplicate = rng.chance(0.07);

      // Si falta información, moderación puede pedir una ampliación antes de decidir.
      if (!complete && rng.chance(0.5)) {
        const reason = 'faltan detalles sobre el tipo de riesgo';
        const asked = step(rng.float(4, 20), (at) => {
          report.awaitingMoreInfo = true;
          push('en_revision', at, 'pedir-ampliacion', moderationNote('pedir-ampliacion', { reason }));
        });
        if (!asked) {
          reports.push(report);
          continue;
        }
        const willAnswer = rng.chance(0.6);
        const answered =
          willAnswer &&
          step(rng.float(24, 72), (at) => {
            report.awaitingMoreInfo = false;
            report.additionalInfo = 'La situación sigue igual; se observa en varias calles de la zona.';
            push('en_revision', at, 'ampliacion-recibida', moderationNote('ampliacion-recibida'));
          });
        if (!answered) {
          // Regla operativa DEMO: sin ampliación en 15 días, se cierra por información insuficiente.
          if (!willAnswer) {
            const reasonClosed = 'Información insuficiente para valorarlo';
            step(MORE_INFO_DEADLINE_HOURS, (at) => {
              report.awaitingMoreInfo = false;
              report.review = { complete: false, pertinent, duplicate };
              report.closure = { at, outcome: 'descartado', note: 'No se recibió la ampliación en 15 días' };
              push('cerrado', at, 'descartar', moderationNote('descartar', { reason: `${reasonClosed} (sin ampliación en 15 días)` }));
            });
          }
          reports.push(report);
          continue;
        }
        complete = true;
      }

      if (!(complete && pertinent && !duplicate)) {
        const reason = duplicate
          ? 'Duplicado de otro reporte'
          : !pertinent
            ? 'Fuera del alcance de Ondara'
            : 'Información insuficiente para valorarlo';
        step(rng.float(2, 20), (at) => {
          report.review = { complete, pertinent, duplicate };
          report.closure = { at, outcome: duplicate ? 'duplicado' : 'descartado', note: reason };
          push('cerrado', at, 'descartar', moderationNote('descartar', { reason }));
        });
        reports.push(report);
        continue;
      }

      const approved = step(rng.float(2, 24), (at) => {
        report.review = { complete: true, pertinent: true, duplicate: false };
        push('verificado', at, 'aprobar', moderationNote('aprobar'));
      });
      if (!approved) {
        reports.push(report);
        continue;
      }
      const assignedTo = rng.chance(0.9) ? responsibleByCategory[category] : undefined;
      if (
        !step(rng.float(4, 110), (at) => {
          report.assignedTo = assignedTo;
          push('canalizado', at, 'canalizar', moderationNote('canalizar', { assignedTo }));
        })
      ) {
        reports.push(report);
        continue;
      }
      if (assignedTo) {
        const outcome: ClosureOutcome = rng.chance(0.75) ? 'atendido-por-autoridad' : 'sin-accion-documentada';
        const reason = outcome === 'atendido-por-autoridad' ? 'se programó una visita de revisión en la zona' : 'plazo del piloto concluido';
        step(rng.float(48, 240), (at) => {
          report.closure = { at, outcome, note: reason };
          push('cerrado', at, 'cerrar', moderationNote('cerrar', { outcome, reason }));
        });
      }
      reports.push(report);
    }
  }
  return reports;
}

let cache: CitizenReport[] | null = null;

/** Copia nueva de los reportes de ejemplo, en su estado inicial (antes de aplicar la bitácora). */
export function getSeedReports(): CitizenReport[] {
  cache ??= buildSeedReports();
  return structuredClone(cache);
}
