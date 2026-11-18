import { CircleAlert, CircleCheck, CircleDashed, Download, FileSpreadsheet, MapPinned } from 'lucide-react';
import { useState } from 'react';
import { useSession } from '../app/session';
import { BarList } from '../components/charts/BarList';
import { DataKindBadge, DemoTag, Pill } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import { CheckboxField, RadioCards, SelectField } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { PageHeader, SectionHeading } from '../components/ui/PageHeader';
import { AsyncContent, EmptyState, LoadingState } from '../components/ui/States';
import { MIN_PUBLIC_COUNT, VECTOR_THRESHOLD_PCT } from '../config/demo';
import { roleAliases } from '../config/roles';
import { TEXTS } from '../config/texts';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { regionName, regions } from '../mocks/regions';
import { channelLabels, reportCategoryLabels, reportStatusLabels } from '../mocks/reports';
import { periodLabels } from '../services/epidemiologyService';
import {
  exportAggregatedReportsCsv,
  getAggregatedReportTable,
  getInstitutionalSummary,
  getPilotOverview,
  getPriorityZones,
  statusColumns,
  type InstitutionalFilters,
} from '../services/indicatorService';
import type { Indicator, IndicatorDimension, PeriodKey, PilotStage } from '../types';
import { downloadCsv } from '../utils/csv';
import { formatDecimal, formatInteger, formatMXN, formatPercent, formatRatio } from '../utils/format';

const DIMENSION_LABELS: Record<IndicatorDimension, string> = {
  utilidad: 'Utilidad',
  oportunidad: 'Oportunidad',
  seguimiento: 'Seguimiento',
  cobertura: 'Cobertura',
  sostenibilidad: 'Sostenibilidad',
};

const PERIODS: PeriodKey[] = ['ultimas-4', 'ultimas-8', 'ultimas-12'];

function formatValue(indicator: Indicator): string {
  if (indicator.value === null) return 'Sin datos';
  switch (indicator.unit) {
    case '%':
      return formatPercent(indicator.value, Number.isInteger(indicator.value) ? 0 : 1);
    case 'horas':
      return `${formatDecimal(indicator.value)} h`;
    case 'MXN':
      return formatMXN(indicator.value);
    default:
      return formatDecimal(indicator.value);
  }
}

function targetText(indicator: Indicator): string {
  if (indicator.target === undefined) return '';
  const symbol = indicator.targetDirection === 'menor-o-igual' ? '≤' : '≥';
  const value =
    indicator.unit === '%' ? `${indicator.target} %` : indicator.unit === 'horas' ? `${indicator.target} h` : indicator.unit === 'MXN' ? formatMXN(indicator.target) : String(indicator.target);
  return `${symbol} ${value}`;
}

function TargetStatus({ indicator }: { indicator: Indicator }) {
  if (indicator.value === null) {
    return (
      <Pill tone="neutral" icon={CircleDashed}>
        Sin datos suficientes
      </Pill>
    );
  }
  if (indicator.target === undefined) {
    return (
      <Pill tone="neutral" icon={CircleDashed}>
        Sin meta: indicador descriptivo
      </Pill>
    );
  }
  const meets = indicator.targetDirection === 'menor-o-igual' ? indicator.value <= indicator.target : indicator.value >= indicator.target;
  return meets ? (
    <Pill tone="forest" icon={CircleCheck}>
      Dentro de la meta de referencia ({targetText(indicator)})
    </Pill>
  ) : (
    <Pill tone="warning" icon={CircleAlert}>
      Fuera de la meta de referencia ({targetText(indicator)})
    </Pill>
  );
}

function IndicatorCard({ indicator }: { indicator: Indicator }) {
  return (
    <article className="card card-cream flex h-full flex-col" aria-labelledby={`indicador-${indicator.id}`}>
      <p className="eyebrow">{DIMENSION_LABELS[indicator.dimension]}</p>
      <h3 id={`indicador-${indicator.id}`} className="mt-1 text-[1.25rem]">
        {indicator.name}
      </h3>
      <p className="mt-3 text-[2.25rem] font-semibold leading-none text-charcoal">{formatValue(indicator)}</p>
      <p className="mt-1.5 text-sm text-muted">
        {indicator.unit === 'por 100 mil hab.' && 'reportes por 100 mil habitantes · '}
        {indicator.numerator !== undefined && indicator.denominator !== undefined
          ? indicator.unit === 'MXN'
            ? `${formatMXN(indicator.numerator)} ÷ ${formatInteger(indicator.denominator)} reportes útiles`
            : `${formatInteger(indicator.numerator)} de ${formatInteger(indicator.denominator)}`
          : indicator.denominator !== undefined
            ? `Calculado con ${formatInteger(indicator.denominator)} reportes`
            : indicator.numerator !== undefined
              ? `${formatInteger(indicator.numerator)} reportes en el periodo`
              : ''}
      </p>
      <div className="mt-3">
        <TargetStatus indicator={indicator} />
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed">{indicator.definition}</p>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-forest-ink underline-offset-2 hover:underline">Fórmula y advertencia</summary>
        <p className="mt-1.5 font-mono text-xs text-muted">{indicator.formula}</p>
        <p className="mt-1.5 text-muted">{indicator.caveat}</p>
      </details>
    </article>
  );
}

const stageTone: Record<PilotStage['status'], 'forest' | 'blue' | 'neutral'> = {
  completada: 'forest',
  'en-curso': 'blue',
  pendiente: 'neutral',
};

const stageLabel: Record<PilotStage['status'], string> = {
  completada: 'Completada',
  'en-curso': 'En curso',
  pendiente: 'Pendiente',
};

function PilotSection() {
  const { resource, reload } = useAsync(getPilotOverview, []);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [decision, setDecision] = useState<'continuar' | 'ajustar' | 'detener' | ''>('');

  return (
    <section aria-labelledby="piloto" className="card card-slate">
      <SectionHeading
        id="piloto"
        eyebrow="Escenario de seguimiento"
        title="Piloto de 90 días"
        description="Cuatro etapas y las preguntas de decisión que se responden al cierre."
      />
      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={2} />}>
        {(pilot) => {
          const progress = Math.round((pilot.currentDay / pilot.totalDays) * 100);
          const provisional = pilot.questions.some((question) => question.provisional);
          return (
            <div className="space-y-6">
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-charcoal">
                    Día {pilot.currentDay} de {pilot.totalDays} <span className="font-normal text-muted">(referencia ilustrativa)</span>
                  </p>
                  <p className="text-sm text-muted tabular-nums">{progress} %</p>
                </div>
                <div
                  className="mt-2 h-3 overflow-hidden rounded-full bg-cream-paper"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={pilot.totalDays}
                  aria-valuenow={pilot.currentDay}
                  aria-label="Avance del piloto"
                >
                  <div className="h-full rounded-full bg-forest-ink" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <ol className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
                {pilot.stages.map((stage) => (
                  <li key={stage.id} className="rounded-[12px] bg-cream-paper p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-[1.25rem]">{stage.name}</h3>
                      <Pill tone={stageTone[stage.status]}>{stageLabel[stage.status]}</Pill>
                    </div>
                    <p className="text-sm text-muted">
                      Días {stage.startDay}–{stage.endDay}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">{stage.objective}</p>
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer text-forest-ink underline-offset-2 hover:underline">Actividades y entregables</summary>
                      <ul className="mt-1.5 list-disc space-y-1 pl-5">
                        {stage.activities.map((activity) => (
                          <li key={activity}>{activity}</li>
                        ))}
                      </ul>
                      <p className="mt-1.5 text-muted">Entregables: {stage.deliverables.join(', ')}.</p>
                    </details>
                  </li>
                ))}
              </ol>

              <div className="rounded-[12px] bg-cream-paper p-4 sm:p-5">
                <h3 className="text-[1.375rem]">Las cinco preguntas de decisión</h3>
                {provisional && (
                  <p className="mt-1 text-sm text-muted">
                    Redacción provisional derivada de las cinco métricas; pendiente de validar con la propuesta conceptual.
                  </p>
                )}
                <ul className="mt-4 space-y-3">
                  {pilot.questions.map((question) => (
                    <li key={question.id}>
                      <CheckboxField
                        label={
                          <>
                            <span className="font-medium">{question.question}</span>{' '}
                            <span className="text-sm text-muted">
                              ({DIMENSION_LABELS[question.dimension]} · evidencia: {question.evidence})
                            </span>
                          </>
                        }
                        checked={checked[question.id] ?? false}
                        onChange={(event) => setChecked((current) => ({ ...current, [question.id]: event.target.checked }))}
                      />
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <RadioCards
                    name="decision-piloto"
                    legend="Borrador de decisión al cierre (no se guarda)"
                    columns={3}
                    value={decision}
                    onChange={setDecision}
                    options={[
                      { value: 'continuar', label: 'Continuar', description: 'Las respuestas sostienen el servicio.' },
                      { value: 'ajustar', label: 'Ajustar', description: 'Cambiar alcance, canales o reglas.' },
                      { value: 'detener', label: 'Detener', description: 'El servicio no resultó útil o sostenible.' },
                    ]}
                  />
                  <p className="mt-2 text-sm text-muted">
                    Preguntas marcadas: {Object.values(checked).filter(Boolean).length} de {pilot.questions.length}. La decisión real
                    corresponde a la autoridad y al equipo del piloto.
                  </p>
                </div>
              </div>
            </div>
          );
        }}
      </AsyncContent>
    </section>
  );
}

export function InstitutionalPage() {
  useDocumentTitle('Centro de vigilancia');
  const { session } = useSession();
  const [filters, setFilters] = useState<InstitutionalFilters>({ regionId: 'todas', period: 'ultimas-4' });
  const summary = useAsync(() => getInstitutionalSummary(filters), [filters]);
  const priority = useAsync(getPriorityZones, []);
  const table = useAsync(() => getAggregatedReportTable(filters), [filters]);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ tone: 'tip' | 'caution'; text: string } | null>(null);

  const exportCsv = async () => {
    setExporting(true);
    setExportMessage(null);
    try {
      const role = session?.role ?? 'admin';
      const result = await exportAggregatedReportsCsv(filters, { role, label: session?.alias ?? roleAliases.admin });
      downloadCsv(result.filename, result.content);
      setExportMessage({
        tone: 'tip',
        text: `Se generó «${result.filename}» con ${result.rows} filas agregadas. El archivo no contiene datos personales.`,
      });
    } catch (error) {
      setExportMessage({ tone: 'caution', text: error instanceof Error ? error.message : 'No se pudo exportar.' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Datos agregados"
        title="Centro de vigilancia epidemiológica"
        description="Herramientas para que el sector salud explore señales, zonas prioritarias, reportes revisados y seguimiento institucional. Las métricas operativas se muestran más abajo."
        meta={
          <>
            <DataKindBadge kind="estimado" compact />
            <DataKindBadge kind="reporte-ciudadano" compact />
            <DemoTag />
          </>
        }
      />

      <form
        className="mb-6 grid grid-cols-1 gap-3 rounded-card bg-border-mist/60 p-4 sm:grid-cols-2 lg:max-w-2xl"
        aria-label="Filtros del panel"
        onSubmit={(event) => event.preventDefault()}
      >
        <SelectField label="Región" value={filters.regionId} onChange={(event) => setFilters((current) => ({ ...current, regionId: event.target.value }))}>
          <option value="todas">Todas las zonas</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Periodo"
          value={filters.period}
          onChange={(event) => setFilters((current) => ({ ...current, period: event.target.value as PeriodKey }))}
        >
          {PERIODS.map((period) => (
            <option key={period} value={period}>
              {periodLabels[period]}
            </option>
          ))}
        </SelectField>
      </form>

      <Notice tone="integrity" className="mb-8">
        {TEXTS.noCausality}
      </Notice>

      <AsyncContent resource={summary.resource} onRetry={summary.reload} loading={<LoadingState lines={4} />}>
        {(data) => (
          <div className="space-y-12">
            <section aria-labelledby="metricas">
              <SectionHeading
                id="metricas"
                title="Métricas primarias"
                description={`${data.regionLabel} · ${data.periodLabel}. ${formatInteger(data.totalReports)} reportes recibidos; ${formatInteger(data.reviewedReports)} con decisión de moderación.`}
              />
              {data.totalReports === 0 ? (
                <EmptyState title="Sin reportes en este filtro" description="Amplía el periodo o elige otra región para calcular las métricas." />
              ) : (
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
                  {data.indicators.map((indicator) => (
                    <li key={indicator.id}>
                      <IndicatorCard indicator={indicator} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="cobertura" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <SectionHeading id="cobertura" title="Participación por zona" as="h2" />
                <BarList
                  ariaLabel="Reportes por 100 mil habitantes por zona"
                  items={data.coverageByZone
                    .slice()
                    .sort((a, b) => b.ratePer100k - a.ratePer100k)
                    .map((row) => ({
                      id: row.regionId,
                      label: regionName(row.regionId),
                      value: row.ratePer100k,
                      display: formatDecimal(row.ratePer100k),
                      note: `${formatInteger(row.reports)} reportes`,
                    }))}
                />
                <p className="mt-2 text-xs text-muted">Valores: reportes por cada 100 mil habitantes (población de referencia).</p>
              </div>
              <div>
                <h2 className="mb-5 text-[1.75rem] sm:text-[2rem]">Participación por canal</h2>
                <BarList
                  ariaLabel="Proporción de reportes por canal"
                  max={100}
                  items={data.coverageByChannel.map((row) => ({
                    id: row.channel,
                    label: channelLabels[row.channel],
                    value: row.share,
                    display: formatPercent(row.share),
                    note: `${formatInteger(row.reports)} reportes`,
                  }))}
                />
                <Notice tone="info" className="mt-4" title="Sesgo de selección">
                  Participan más las zonas con códigos QR, aliados comunitarios o mejor conectividad. {TEXTS.participationCaveat}
                </Notice>
              </div>
            </section>
          </div>
        )}
      </AsyncContent>

      <section aria-labelledby="prioritarias" className="mt-12">
        <SectionHeading
          id="prioritarias"
          title="Zonas prioritarias"
          description={`Puntaje: señal estadística en datos ilustrativos (2 puntos), ovitrampas positivas ≥ ${VECTOR_THRESHOLD_PCT} % en la última semana (1 punto) y al menos ${MIN_PUBLIC_COUNT} observaciones revisadas de posibles criaderos en 4 semanas (1 punto). Los reportes sin verificar se muestran como contexto y no suman.`}
        />
        <Notice tone="caution" className="mb-4">
          {TEXTS.priorityCaveat}
        </Notice>
        <AsyncContent resource={priority.resource} onRetry={priority.reload} loading={<LoadingState lines={3} />}>
          {(zones) => (
            <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {zones.map((zone, index) => (
                <li key={zone.regionId} className="card card-cream">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="flex items-center gap-2 text-[1.25rem]">
                      <MapPinned className="size-5" aria-hidden="true" />
                      <span className="sr-only">Posición {index + 1}: </span>
                      {regionName(zone.regionId)}
                    </h3>
                    <Pill tone={zone.score >= 2 ? 'warning' : 'neutral'}>Puntaje {zone.score} de 4</Pill>
                  </div>
                  {zone.reasons.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.9375rem]">
                      {zone.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-[0.9375rem] text-muted">No cumple ninguno de los criterios de puntaje.</p>
                  )}
                  <p className="mt-3 text-sm text-muted">
                    Contexto: {formatInteger(zone.unverifiedReports)} reportes sin verificar en 4 semanas
                    {zone.officialRatio ? ` · razón máxima frente a la línea base ${formatRatio(zone.officialRatio)}` : ''}.
                  </p>
                </li>
              ))}
            </ol>
          )}
        </AsyncContent>
      </section>

      <section aria-labelledby="agregados" className="mt-12">
        <SectionHeading
          id="agregados"
          title="Reportes agregados"
          description="Conteos por zona, categoría y estado. Sin textos libres, folios ni datos personales. Conteos exactos para uso institucional."
          actions={
            <Button icon={Download} loading={exporting} onClick={exportCsv} variant="secondary">
              Exportar CSV agregado
            </Button>
          }
        />
        <p className="mb-3 flex items-start gap-2 text-sm text-muted">
          <FileSpreadsheet className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Exportación de información ilustrativa: el archivo se genera en tu navegador e incluye zona, semana, categoría, estado y conteo. No contiene
          datos personales.
        </p>
        {exportMessage && (
          <Notice tone={exportMessage.tone} className="mb-4" role="status">
            {exportMessage.text}
          </Notice>
        )}
        <AsyncContent resource={table.resource} onRetry={table.reload} loading={<LoadingState lines={3} />}>
          {(rows) =>
            rows.length === 0 ? (
              <EmptyState title="Sin reportes en este filtro" description="Amplía el periodo o elige otra región." />
            ) : (
              <div className="relative overflow-x-auto rounded-card border border-border-mist" tabIndex={0} aria-label="Tabla de reportes agregados, desplazable">
                <table className="table-base min-w-[48rem]">
                  <caption className="sr-only">Reportes agregados por zona, categoría y estado</caption>
                  <thead>
                    <tr>
                      <th scope="col">Zona</th>
                      <th scope="col">Categoría</th>
                      {statusColumns.map((status) => (
                        <th key={status} scope="col" className="text-right">
                          {reportStatusLabels[status]}
                        </th>
                      ))}
                      <th scope="col" className="text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {rows.map((row) => (
                      <tr key={`${row.regionId}-${row.category}`}>
                        <th scope="row" className="font-medium">
                          {regionName(row.regionId)}
                        </th>
                        <td>{reportCategoryLabels[row.category]}</td>
                        {statusColumns.map((status) => (
                          <td key={status} className="text-right">
                            {row.counts[status]}
                          </td>
                        ))}
                        <td className="text-right font-semibold">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </AsyncContent>
      </section>

      <div className="mt-12">
        <PilotSection />
      </div>
    </>
  );
}
