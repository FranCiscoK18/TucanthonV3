import { ArrowLeft, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PeriodBars } from '../components/charts/PeriodBars';
import { TrendChart } from '../components/charts/TrendChart';
import { DataKindBadge } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { Field } from '../components/ui/Form';
import { PageHeader, Section, SourceNote } from '../components/ui/Layout';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { diseaseCategoryLabels } from '../mocks/diseases';
import { getDiseaseDetail } from '../services/epidemiologyService';
import type { SignalResult } from '../types';
import { weekLabel } from '../utils/dates';
import { formatDecimal, formatNumber } from '../utils/format';
import { SIGNAL_DISCLAIMER } from '../utils/signals';

export default function DiseaseDetail() {
  const { id = '' } = useParams();
  const { data, loading, error, reload } = useAsync(() => getDiseaseDetail(id), [id]);
  const [regionId, setRegionId] = useState<string>('todas');
  const [compareWeeks, setCompareWeeks] = useState<4 | 6>(4);
  useDocumentTitle(data?.disease.name ?? 'Enfermedad');

  const view = useMemo(() => {
    if (!data) return null;
    const regional = data.byRegion.find((r) => r.region.id === regionId);
    const series = regional ? regional.series : data.series;
    const signal = regional ? regional.signal : data.signal;
    const { windowWeeks, baselineWeeks } = signal.criteria;
    const baselineSlice = series.slice(-(windowWeeks + baselineWeeks), -windowWeeks);
    const baselineWeekly = baselineSlice.length ? baselineSlice.reduce((a, b) => a + b, 0) / baselineSlice.length : 0;
    const points = data.weeks.map((week, i) => ({
      week,
      value: series[i] ?? 0,
      baseline: i >= data.weeks.length - (windowWeeks + baselineWeeks) ? baselineWeekly : undefined,
    }));
    const current = series.slice(-compareWeeks).reduce((a, b) => a + b, 0);
    const previous = series.slice(-compareWeeks * 2, -compareWeeks).reduce((a, b) => a + b, 0);
    return { series, signal, points, current, previous, label: regional ? regional.region.name : 'Todo Cancún' };
  }, [data, regionId, compareWeeks]);

  if (loading) return <LoadingState rows={3} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data || !view)
    return (
      <EmptyState
        title="Enfermedad no encontrada"
        description="El identificador no corresponde al catálogo DEMO."
        action={
          <Link to="/enfermedades" className="btn btn-primary">
            Volver al catálogo
          </Link>
        }
      />
    );

  const { disease } = data;
  return (
    <>
      <Link to="/enfermedades" className="link mb-6 inline-flex items-center gap-1.5 text-[14px]">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Enfermedades y señales
      </Link>
      <PageHeader eyebrow={diseaseCategoryLabels[disease.category]} title={disease.name} description={disease.description} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="card min-w-0">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <DataKindBadge kind="oficial" />
              <h2 className="mt-2 text-[18px] font-semibold text-forest">Registros semanales · {view.label}</h2>
              <p className="text-[13px] text-muted">
                Línea punteada: promedio semanal de la línea base. Franja verde: ventana de la señal.
              </p>
            </div>
            <Field id="zona-detalle" label="Zona" className="sm:w-56">
              <select id="zona-detalle" className="input" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                <option value="todas">Todo Cancún</option>
                {data.byRegion.map((r) => (
                  <option key={r.region.id} value={r.region.id}>
                    {r.region.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <TrendChart
            data={view.points}
            unit="registros DEMO"
            windowWeeks={view.signal.criteria.windowWeeks}
            ariaLabel={`Tendencia semanal de registros DEMO de ${disease.name} en ${view.label}, semanas ${weekLabel(data.weeks[0] ?? '')} a ${weekLabel(
              data.weeks[data.weeks.length - 1] ?? '',
            )}. Último valor ${formatNumber(view.series[view.series.length - 1] ?? 0)}.`}
          />
          <SourceNote source={data.source} cutoffDate={data.cutoffDate} />
        </div>

        <SignalCard signal={view.signal} label={view.label} />
      </div>

      <Section id="comparacion" eyebrow="Comparación de periodos" title="Periodo actual frente al anterior">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="card min-w-0">
            <PeriodBars
              ariaLabel={`Comparación: ${formatNumber(view.previous)} registros en el periodo anterior y ${formatNumber(view.current)} en el actual`}
              data={[
                { label: `${compareWeeks} sem. anteriores`, value: view.previous },
                { label: `Últimas ${compareWeeks} sem.`, value: view.current },
              ]}
            />
          </div>
          <div className="panel-keylime">
            <Field id="comparar" label="Tamaño del periodo">
              <select id="comparar" className="input" value={compareWeeks} onChange={(e) => setCompareWeeks(Number(e.target.value) as 4 | 6)}>
                <option value={4}>4 semanas</option>
                <option value={6}>6 semanas</option>
              </select>
            </Field>
            <p className="mt-4 text-[15px]">
              Variación:{' '}
              <strong>
                {view.previous > 0 ? `${view.current >= view.previous ? '+' : ''}${formatDecimal(((view.current - view.previous) / view.previous) * 100)} %` : 'sin base de comparación'}
              </strong>
            </p>
            <p className="mt-2 text-[13px] text-muted">
              Una variación de registros no equivale a incidencia clínica: puede deberse a cambios en la notificación o en el acceso a servicios.
            </p>
          </div>
        </div>
      </Section>

      <Section id="tabla" eyebrow="Datos" title="Tabla de datos DEMO por zona">
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Registros DEMO de {disease.name} por zona y semana</caption>
            <thead>
              <tr>
                <th scope="col">Zona</th>
                {data.weeks.slice(-6).map((w) => (
                  <th key={w} scope="col" className="num">
                    {weekLabel(w)}
                  </th>
                ))}
                <th scope="col" className="num">
                  Total 12 sem.
                </th>
                <th scope="col">Señal</th>
              </tr>
            </thead>
            <tbody>
              {data.byRegion.map((r) => (
                <tr key={r.region.id}>
                  <th scope="row" className="!bg-transparent font-medium">
                    {r.region.name}
                  </th>
                  {r.series.slice(-6).map((v, i) => (
                    <td key={i} className="num">
                      {formatNumber(v)}
                    </td>
                  ))}
                  <td className="num font-semibold">{formatNumber(r.total)}</td>
                  <td>{r.signal.triggered ? 'Cambio sobre línea base' : r.signal.meetsMinimum ? 'Sin cambio inusual' : 'Datos insuficientes'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[13px] text-muted">Se muestran las últimas 6 semanas. Conteos agregados; nunca individuales.</p>
      </Section>

      <Section id="prevencion" eyebrow="Información general" title="Prevención">
        <div className="panel-keylime max-w-3xl">
          <p className="text-[16px]">{disease.prevention}</p>
          <p className="mt-3 flex items-start gap-2 text-[13.5px] text-muted">
            <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            Información general, no orientación clínica. Ante síntomas, acude a un servicio de salud.
          </p>
        </div>
      </Section>
    </>
  );
}

function SignalCard({ signal, label }: { signal: SignalResult; label: string }) {
  const { criteria } = signal;
  return (
    <aside className={signal.triggered ? 'rounded-[14px] bg-caution-bg p-6' : 'panel-keylime'} aria-labelledby="senal-titulo">
      <p className="eyebrow">Señal por incremento inusual</p>
      <h2 id="senal-titulo" className="title-display mt-2 text-[28px]">
        {signal.triggered ? 'Cambio sobre la línea base' : signal.meetsMinimum ? 'Sin cambio inusual' : 'Datos insuficientes'}
      </h2>
      <p className="mt-1 text-[13.5px] text-muted">{label}</p>
      <dl className="mt-4 space-y-2 text-[14px]">
        <Row term="Ventana de tiempo" value={`Últimas ${criteria.windowWeeks} semanas`} />
        <Row term="Línea base" value={`Promedio de las ${criteria.baselineWeeks} semanas previas (×${criteria.windowWeeks})`} />
        <Row term="Umbral" value={`Ventana ≥ ${formatDecimal(criteria.ratioThreshold)} × línea base`} />
        <Row term="Mínimo de observaciones" value={`${criteria.minObservations} registros en la ventana`} />
        <Row term="Valor en la ventana" value={formatNumber(signal.windowTotal)} />
        <Row term="Línea base esperada" value={formatDecimal(signal.baselineMean)} />
        <Row term="Razón" value={signal.ratio === null ? '—' : `${formatDecimal(signal.ratio)} ×`} />
      </dl>
      <Notice tone="info" className="mt-4">
        {SIGNAL_DISCLAIMER}
      </Notice>
    </aside>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-black/5 pb-1.5">
      <dt className="font-medium">{term}</dt>
      <dd className="text-right tabular-nums">{value}</dd>
    </div>
  );
}
