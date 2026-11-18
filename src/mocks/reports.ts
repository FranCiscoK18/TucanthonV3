import type {
  CitizenReport,
  ReportCategory,
  ReportChannel,
  ReportStatus,
  ReportStatusChange,
  ReviewedObservation,
} from '../types';
import { DEMO_WEEKS } from '../utils/dates';
import { regions } from './regions';
import { createRng } from './seed';

export const reportCategoryLabels: Record<ReportCategory, string> = {
  posible_criadero: 'Posible criadero',
  riesgo_ambiental: 'Riesgo ambiental',
  sintomas_agregados: 'Síntomas agregados',
  otro: 'Otro',
};

export const reportCategoryHelp: Record<ReportCategory, string> = {
  posible_criadero: 'Recipientes, llantas, cacharros o encharcamientos donde podría acumularse agua.',
  riesgo_ambiental: 'Basura acumulada, drenaje desbordado, agua estancada en vía pública u otro riesgo del entorno.',
  sintomas_agregados:
    'Percepción general de síntomas en tu entorno (p. ej. "varias personas con fiebre en la escuela"), sin identificar a nadie.',
  otro: 'Cualquier otra observación de salud pública que no encaje en las categorías anteriores.',
};

export const reportChannelLabels: Record<ReportChannel, string> = {
  sitio_movil: 'Sitio móvil',
  codigo_qr: 'Código QR',
  aliado_comunitario: 'Aliado comunitario',
};

/** Significado de cada estado. "Verificado" NO significa caso confirmado. */
export const reportStatusInfo: Record<ReportStatus, { label: string; meaning: string }> = {
  pendiente: {
    label: 'Pendiente',
    meaning: 'Recibido. Aún no lo revisa nadie del equipo.',
  },
  en_revision: {
    label: 'En revisión',
    meaning: 'El equipo revisa si está completo, es pertinente y no está duplicado. Puede pedirse más información.',
  },
  verificado: {
    label: 'Verificado',
    meaning: 'Revisado como observación útil. No es un caso confirmado ni un diagnóstico.',
  },
  canalizado: {
    label: 'Canalizado',
    meaning: 'Enviado al área responsable para su valoración. La autoridad decide si actúa y cómo.',
  },
  cerrado: {
    label: 'Cerrado',
    meaning: 'Seguimiento terminado: atendido por el área responsable, duplicado o descartado, con motivo registrado.',
  },
};

export const reportStatusOrder: ReportStatus[] = ['pendiente', 'en_revision', 'verificado', 'canalizado', 'cerrado'];

const sampleComments: Record<ReportCategory, string[]> = {
  posible_criadero: [
    'Llantas acumuladas con agua en terreno baldío.',
    'Cubetas destapadas en área común del parque.',
    'Encharcamiento que no se seca desde hace varios días.',
    'Cacharros con agua de lluvia junto a la cancha.',
  ],
  riesgo_ambiental: [
    'Basura acumulada en esquina, sin recolección reciente.',
    'Drenaje pluvial tapado después de la lluvia.',
    'Agua estancada en banqueta frente a área pública.',
  ],
  sintomas_agregados: [
    'Se comenta que varias personas del entorno escolar tienen fiebre.',
    'Percepción de más tos y catarro en la zona esta semana.',
  ],
  otro: ['Fauna nociva visible en área pública.', 'Fuga de agua en vía pública que genera encharcamiento.'],
};

/** Inicio (lunes) de la semana DEMO `2026-Sxx`. La semana 1 de 2026 inicia el 29-dic-2025. */
export function weekStart(week: string): Date {
  const n = Number(week.split('-S')[1] ?? '1');
  const start = new Date(2025, 11, 29);
  start.setDate(start.getDate() + (n - 1) * 7);
  return start;
}

const categoryWeights: Record<string, Record<ReportCategory, number>> = {
  poniente: { posible_criadero: 0.55, riesgo_ambiental: 0.25, sintomas_agregados: 0.12, otro: 0.08 },
  noroeste: { posible_criadero: 0.5, riesgo_ambiental: 0.28, sintomas_agregados: 0.14, otro: 0.08 },
  default: { posible_criadero: 0.38, riesgo_ambiental: 0.32, sintomas_agregados: 0.18, otro: 0.12 },
};

/** Participación DEMO por zona: refleja adopción del canal, no riesgo. */
const participation: Record<string, number> = {
  centro: 1.3,
  norte: 0.9,
  noroeste: 1.1,
  poniente: 1.2,
  sureste: 0.8,
  sur: 0.6,
  hotelera: 0.3,
};

function pick<T extends string>(rng: () => number, weights: Record<T, number>): T {
  const entries = Object.entries(weights) as Array<[T, number]>;
  let r = rng();
  for (const [key, w] of entries) {
    r -= w;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1]![0];
}

function buildHistory(createdAt: Date, finalStatus: ReportStatus, rng: () => number): ReportStatusChange[] {
  const history: ReportStatusChange[] = [{ status: 'pendiente', at: createdAt.toISOString(), note: 'Reporte recibido.' }];
  const idx = reportStatusOrder.indexOf(finalStatus);
  let t = createdAt.getTime();
  const notes: Record<ReportStatus, string> = {
    pendiente: 'Reporte recibido.',
    en_revision: 'Asignado a la mesa de revisión.',
    verificado: 'Revisado como observación útil (no confirma ningún caso).',
    canalizado: 'Canalizado al área responsable de la zona para su valoración.',
    cerrado: 'Cierre documentado por el área responsable.',
  };
  for (let i = 1; i <= idx; i += 1) {
    t += (6 + rng() * 40) * 36e5;
    const status = reportStatusOrder[i]!;
    history.push({ status, at: new Date(t).toISOString(), note: notes[status] });
  }
  return history;
}

function buildSeedReports(): CitizenReport[] {
  const rng = createRng(46);
  const reports: CitizenReport[] = [];
  let counter = 1;
  DEMO_WEEKS.forEach((week, weekIndex) => {
    const start = weekStart(week);
    for (const region of regions) {
      const growth = 0.6 + weekIndex * 0.07; // la participación crece con la difusión del piloto
      const expected = 2.2 * (participation[region.id] ?? 1) * growth;
      const n = Math.max(0, Math.round(expected * (0.6 + rng() * 0.8)));
      for (let k = 0; k < n; k += 1) {
        const category = pick(rng, categoryWeights[region.id] ?? categoryWeights.default!);
        const createdAt = new Date(start.getTime() + rng() * 6.5 * 864e5);
        const age = DEMO_WEEKS.length - 1 - weekIndex;
        let status: ReportStatus;
        if (age === 0) status = rng() < 0.6 ? 'pendiente' : 'en_revision';
        else if (age === 1) status = pick(rng, { en_revision: 0.4, verificado: 0.35, pendiente: 0.1, canalizado: 0.15 });
        else if (age <= 3) status = pick(rng, { verificado: 0.3, canalizado: 0.45, cerrado: 0.25 });
        else status = pick(rng, { canalizado: 0.15, cerrado: 0.85 });
        const comments = sampleComments[category];
        const channel = pick(rng, { sitio_movil: 0.6, codigo_qr: 0.25, aliado_comunitario: 0.15 });
        const id = `rep-${String(counter).padStart(4, '0')}`;
        reports.push({
          id,
          folio: `REP-DEMO-${String(1000 + counter)}`,
          category,
          approximateZone: region.id,
          comments: comments[Math.floor(rng() * comments.length)] ?? '',
          channel,
          status,
          createdAt: createdAt.toISOString(),
          history: buildHistory(createdAt, status, rng),
          isDemo: true,
        });
        counter += 1;
      }
    }
  });
  return reports;
}

/** Reportes DEMO de terceros (en memoria). Los propios viven en localStorage. */
export const seedReports: CitizenReport[] = buildSeedReports();

/** Deriva observaciones revisadas (verificado o canalizado) a partir de reportes. */
export function toReviewedObservations(reports: CitizenReport[]): ReviewedObservation[] {
  return reports
    .filter((r) => r.status === 'verificado' || r.status === 'canalizado' || (r.status === 'cerrado' && r.history.some((h) => h.status === 'verificado')))
    .map((r) => {
      const reviewed = r.history.find((h) => h.status === 'verificado');
      return {
        id: `obs-${r.id}`,
        reportId: r.id,
        regionId: r.approximateZone,
        category: r.category,
        reviewedAt: reviewed?.at ?? r.createdAt,
        usefulness: 'util',
        channeledTo: r.history.some((h) => h.status === 'canalizado') ? 'Área responsable de la zona (DEMO)' : undefined,
        isDemo: true,
      };
    });
}
