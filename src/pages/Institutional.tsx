import { CheckCircle2, CircleDashed, Download, Loader2, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSession } from '../app/SessionContext';
import { Sparkline } from '../components/charts/Sparkline';
import { DataKindBadge } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { Field } from '../components/ui/Form';
import { PageHeader, Section, SourceNote } from '../components/ui/Layout';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { dimensionLabels } from '../mocks/institutional';
import { regionName, regions } from '../mocks/regions';
import { reportCategoryLabels, reportChannelLabels, reportStatusInfo, reportStatusOrder } from '../mocks/reports';
import { sourceById } from '../mocks/sources';
import { recordAudit } from '../services/auditService';
import { getInstitutionalOverview } from '../services/institutionalService';
import { getAggregatedReports, getParticipationByChannel, type AggregatedReportRow } from '../services/reportService';
import type { Indicator, PeriodWeeks, PilotStage } from '../types';
import { toCsv, downloadText } from '../utils/csv';
import { DEMO_CUTOFF_DATE, weekLabel } from '../utils/dates';
import { formatDecimal, formatNumber } from '../utils/format';

type Answer = 'sin_evaluar' | 'si' | 'parcial' | 'no';
const ANSWER_LABELS: Record<Answer, string> = { sin_evaluar: 'Sin evaluar', si: 'Sí', parcial: 'Parcialmente', no: 'No' };

export default function Institutional() {
  useDocumentTitle('Panel institucional');
  const overview = useAsync(getInstitutionalOverview, []);
  const participation = useAsync(getParticipationByChannel, []);

  return (
    <>
      <PageHeader
        eyebrow="Panel institucional"
        title="Operación del piloto"
        description="Métricas primarias de utilidad, oportunidad, seguimiento, cobertura y sostenibilidad. Solo datos agregados, sin datos personales."
      />
      <Notice tone="info" title="Ninguna métrica es causalidad clínica">
        Estos indicadores miden cómo funciona el proceso de reportes, no la salud de la población. No permiten afirmar que la plataforma redujo
        enfermedades ni que una variación de reportes equivale a incidencia.
      </Notice>

      {overview.loading ? (
        <div className="mt-8">
          <LoadingState rows={6} />
        </div>
      ) : overview.error ? (
        <div className="mt-8">
          <ErrorState error={overview.error} onRetry={overview.reload} />
        </div>
      ) : overview.data ? (
        <>
          <Section id="metricas" eyebrow="Métricas primarias" title="Indicadores del periodo">
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {overview.data.indicators.map((i) => (
                <li key={i.id}>
                  <IndicatorCard indicator={i} />
                </li>
              ))}
            </ul>
            <SourceNote cutoffDate={overview.data.cutoffDate}>Tendencia: últimas 8 semanas.</SourceNote>
          </Section>

          <Section
            id="cobertura"
            eyebrow="Cobertura"
            title="Participación por zona y canal"
            description="Últimas 4 semanas. Sesgo de selección: participan más quienes conocen el canal y tienen conectividad. Pocos reportes no significa ausencia de riesgo."
          >
            {participation.loading ? (
              <LoadingState variant="list" rows={2} />
            ) : participation.error ? (
              <ErrorState error={participation.error} onRetry={participation.reload} />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">Reportes ciudadanos por zona y canal, últimas 4 semanas</caption>
                  <thead>
                    <tr>
                      <th scope="col">Zona</th>
                      {(Object.keys(reportChannelLabels) as Array<keyof typeof reportChannelLabels>).map((c) => (
                        <th key={c} scope="col" className="num">
                          {reportChannelLabels[c]}
                        </th>
                      ))}
                      <th scope="col" className="num">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map((r) => {
                      const row = participation.data?.find((p) => p.regionId === r.id);
                      const total = row ? row.sitio_movil + row.codigo_qr + row.aliado_comunitario : 0;
                      return (
                        <tr key={r.id}>
                          <th scope="row" className="!bg-transparent font-medium">
                            {r.name}
                          </th>
                          <td className="num">{row?.sitio_movil ?? 0}</td>
                          <td className="num">{row?.codigo_qr ?? 0}</td>
                          <td className="num">{row?.aliado_comunitario ?? 0}</td>
                          <td className="num font-semibold">{total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section
            id="prioridad"
            eyebrow="Zonas prioritarias"
            title="Zonas sugeridas para revisión"
            description="Criterio: combinación de señales en datos oficiales DEMO, índice vectorial DEMO y observaciones revisadas, más brechas de participación."
          >
            <Notice tone="caution" className="mb-4" title="La prioridad la define la autoridad, no la plataforma">
              Esta lista es una sugerencia para conversación técnica. No es una declaratoria ni una orden de intervención.
            </Notice>
            <ol className="grid gap-4 md:grid-cols-3">
              {overview.data.priorityZones.map((z, idx) => (
                <li key={z.regionId} className="card">
                  <p className="eyebrow">Sugerencia {idx + 1}</p>
                  <h3 className="title-display mt-1 text-[28px]">{regionName(z.regionId)}</h3>
                  <p className="mt-1 text-[13.5px] text-muted">Puntaje compuesto DEMO: {formatDecimal(z.score)} (0 a 1)</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px]">
                    {z.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Section>

          <AggregatedReportsSection />

          <Section id="piloto" eyebrow="Piloto de 90 días" title="Etapas y decisión">
            <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {overview.data.pilotStages.map((s, i) => (
                <li key={s.id}>
                  <StageCard stage={s} index={i} />
                </li>
              ))}
            </ol>
            <DecisionChecklist questions={overview.data.pilotQuestions} />
          </Section>
        </>
      ) : null}
    </>
  );
}

function IndicatorCard({ indicator: i }: { indicator: Indicator }) {
  return (
    <article className="card flex h-full flex-col">
      <div className="flex items-center justify-between gap-2">
        <span className="pill bg-keylime text-forest">{dimensionLabels[i.dimension]}</span>
        <DataKindBadge kind="simulado" short />
      </div>
      <h3 className="mt-3 text-[16px] font-semibold text-ink">{i.name}</h3>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="title-display text-[44px] leading-none">
          {formatNumber(i.value)}
          <span className="ml-1.5 font-sans text-[14px] text-muted">{i.unit}</span>
        </p>
        <Sparkline values={i.trend} label={`Tendencia de ${i.name}: de ${i.trend[0]} a ${i.trend[i.trend.length - 1]} ${i.unit}`} />
      </div>
      <p className="mt-3 text-[14px]">{i.definition}</p>
      <p className="mt-2 text-[13px] text-muted">
        <span className="font-semibold text-ink">Nota: </span>
        {i.note}
      </p>
      {i.target && <p className="mt-2 text-[13px] text-muted">{i.target}</p>}
    </article>
  );
}

function AggregatedReportsSection() {
  const { role } = useSession();
  const [regionId, setRegionId] = useState<string>('todas');
  const [weeks, setWeeks] = useState<PeriodWeeks>(4);
  const [exported, setExported] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync(() => getAggregatedReports({ regionId, weeks }), [regionId, weeks]);

  const totals = useMemo(() => {
    const t = { total: 0, pendiente: 0, en_revision: 0, verificado: 0, canalizado: 0, cerrado: 0 };
    (data ?? []).forEach((r) => {
      t.total += r.total;
      reportStatusOrder.forEach((s) => (t[s] += r.byStatus[s]));
    });
    return t;
  }, [data]);

  const exportCsv = (rows: AggregatedReportRow[]) => {
    const csv = toCsv(
      ['zona', 'semana', 'categoria', 'total', ...reportStatusOrder, 'nota'],
      rows.map((r) => [
        regionName(r.regionId),
        r.week,
        reportCategoryLabels[r.category],
        r.total,
        ...reportStatusOrder.map((s) => r.byStatus[s]),
        'DEMO - agregado sin datos personales',
      ]),
    );
    const filename = `ondara-demo-agregados-${regionId}-${weeks}sem.csv`;
    downloadText(filename, csv);
    recordAudit({ actorRole: role, action: 'exportacion_csv', entityType: 'exportacion', entityId: filename, reason: 'Exportación de agregados desde el panel institucional.' });
    setExported(filename);
  };

  return (
    <Section
      id="agregados"
      eyebrow="Reportes agregados"
      title="Reportes por zona, semana y categoría"
      description="Conteos agregados de reportes ciudadanos (terceros DEMO y los creados en este navegador). Sin texto libre ni datos personales."
    >
      <div className="flex flex-col gap-4 rounded-[14px] bg-paper p-4 md:flex-row md:items-end md:justify-between md:p-5">
        <div className="grid flex-1 gap-4 sm:grid-cols-2 md:max-w-xl">
          <Field id="ag-zona" label="Región">
            <select id="ag-zona" className="input" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
              <option value="todas">Todas</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="ag-periodo" label="Periodo">
            <select id="ag-periodo" className="input" value={weeks} onChange={(e) => setWeeks(Number(e.target.value) as PeriodWeeks)}>
              <option value={4}>Últimas 4 semanas</option>
              <option value={8}>Últimas 8 semanas</option>
              <option value={12}>Últimas 12 semanas</option>
            </select>
          </Field>
        </div>
        <button type="button" className="btn btn-primary" disabled={!data?.length || loading} onClick={() => data && exportCsv(data)}>
          <Download aria-hidden className="h-4 w-4" />
          Exportar CSV (DEMO)
        </button>
      </div>
      <p className="mt-2 flex items-start gap-2 text-[13.5px] text-muted">
        <ShieldAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
        El archivo no contiene datos personales: solo conteos agregados por zona, semana, categoría y estado. La exportación queda en la bitácora.
      </p>
      {exported && (
        <Notice tone="success" role="status" className="mt-3">
          Se generó «{exported}» en tu navegador. No se envió a ningún servidor.
        </Notice>
      )}

      <div className="mt-4">
        {loading ? (
          <LoadingState variant="list" rows={3} />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data?.length ? (
          <EmptyState title="Sin reportes en el periodo" description="Amplía el periodo o elige otra región." />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2 text-[13.5px]">
              <span className="pill bg-keylime text-forest">Total: {formatNumber(totals.total)}</span>
              {reportStatusOrder.map((s) => (
                <span key={s} className="pill bg-paper text-ink">
                  {reportStatusInfo[s].label}: {formatNumber(totals[s])}
                </span>
              ))}
            </div>
            <div className="table-wrap max-h-[480px] overflow-y-auto">
              <table className="table">
                <caption className="sr-only">Reportes agregados por zona, semana y categoría</caption>
                <thead className="sticky top-0">
                  <tr>
                    <th scope="col">Zona</th>
                    <th scope="col">Semana</th>
                    <th scope="col">Categoría</th>
                    <th scope="col" className="num">
                      Total
                    </th>
                    {reportStatusOrder.map((s) => (
                      <th key={s} scope="col" className="num">
                        {reportStatusInfo[s].label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((r) => (
                    <tr key={`${r.regionId}-${r.week}-${r.category}`}>
                      <td>{regionName(r.regionId)}</td>
                      <td>{weekLabel(r.week)}</td>
                      <td>{reportCategoryLabels[r.category]}</td>
                      <td className="num font-semibold">{r.total}</td>
                      {reportStatusOrder.map((s) => (
                        <td key={s} className="num">
                          {r.byStatus[s]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <SourceNote source={sourceById('src-ciudadano')} cutoffDate={DEMO_CUTOFF_DATE} />
    </Section>
  );
}

function StageCard({ stage: s, index }: { stage: PilotStage; index: number }) {
  const icon =
    s.status === 'completada' ? (
      <CheckCircle2 aria-hidden className="h-5 w-5 text-success" />
    ) : s.status === 'en_curso' ? (
      <Loader2 aria-hidden className="h-5 w-5 text-caution" />
    ) : (
      <CircleDashed aria-hidden className="h-5 w-5 text-muted" />
    );
  const label = s.status === 'completada' ? 'Completada' : s.status === 'en_curso' ? 'En curso' : 'Pendiente';
  return (
    <article className={`h-full rounded-[14px] p-5 ${s.status === 'en_curso' ? 'bg-sage' : s.status === 'completada' ? 'bg-keylime' : 'bg-paper'}`}>
      <div className="flex items-center justify-between">
        <p className="eyebrow">
          Etapa {index + 1} · {s.days}
        </p>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
          {icon}
          {label} (DEMO)
        </span>
      </div>
      <h3 className="title-display mt-2 text-[28px]">{s.name}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px]">
        {s.activities.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <p className="mt-3 text-[13.5px]">
        <span className="font-semibold">Entregable: </span>
        {s.deliverable}
      </p>
    </article>
  );
}

function DecisionChecklist({ questions }: { questions: Array<{ id: string; question: string; dimension: Indicator['dimension']; evidence: string }> }) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const evaluated = questions.filter((q) => (answers[q.id] ?? 'sin_evaluar') !== 'sin_evaluar').length;
  const yes = questions.filter((q) => answers[q.id] === 'si').length;
  return (
    <div className="card mt-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Checklist de decisión</p>
          <h3 className="title-display mt-1 text-[30px]">Las cinco preguntas del cierre</h3>
          <p className="mt-1 text-[13.5px] text-muted">
            Derivadas de las métricas primarias; validar su redacción con el documento conceptual. Las respuestas no se guardan.
          </p>
        </div>
        <p className="text-[14px]" aria-live="polite">
          {evaluated}/5 evaluadas · {yes} con respuesta «Sí»
        </p>
      </div>
      <ol className="mt-4 divide-y divide-hairline">
        {questions.map((q, i) => (
          <li key={q.id} className="grid gap-3 py-4 md:grid-cols-[1fr_200px] md:items-center">
            <div>
              <p className="font-medium">
                {i + 1}. {q.question}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {dimensionLabels[q.dimension]} · Evidencia: {q.evidence}
              </p>
            </div>
            <label className="sr-only" htmlFor={`q-${q.id}`}>
              Respuesta a la pregunta {i + 1}
            </label>
            <select
              id={`q-${q.id}`}
              className="input"
              value={answers[q.id] ?? 'sin_evaluar'}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value as Answer }))}
            >
              {(Object.keys(ANSWER_LABELS) as Answer[]).map((a) => (
                <option key={a} value={a}>
                  {ANSWER_LABELS[a]}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ol>
      <Notice tone="info" className="mt-2">
        La decisión de continuar, ajustar o detener el piloto corresponde a la autoridad y a los aliados. No se presupone subsidio ni adjudicación.
      </Notice>
    </div>
  );
}
