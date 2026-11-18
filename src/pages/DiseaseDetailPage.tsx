import { ArrowLeft, ShieldPlus } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router';
import { BarList } from '../components/charts/BarList';
import { TrendChart } from '../components/charts/TrendChart';
import { SignalCriteria } from '../components/SignalCriteria';
import { Pill } from '../components/ui/Badges';
import { SelectField } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { PageHeader, SectionHeading } from '../components/ui/PageHeader';
import { ChangeText, SignalBadge } from '../components/ui/SignalBadge';
import { SourceMeta } from '../components/ui/SourceMeta';
import { AsyncContent, LoadingState } from '../components/ui/States';
import { SIGNAL_CRITERIA, VECTOR_THRESHOLD_PCT } from '../config/demo';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { categoryLabels, diseaseById } from '../mocks/diseases';
import { regionById, regionName, regions } from '../mocks/regions';
import { getDiseaseDetail } from '../services/epidemiologyService';
import { formatDate } from '../utils/dates';
import { formatDecimal, formatInteger, formatRatio, formatSignedPercentChange } from '../utils/format';
import { NotFoundPage } from './NotFoundPage';

export function DiseaseDetailPage() {
  const { diseaseId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const zoneParam = params.get('zona');
  const scope = zoneParam && regionById.has(zoneParam) ? zoneParam : 'ciudad';
  const disease = diseaseById.get(diseaseId);
  useDocumentTitle(disease ? disease.name : 'Enfermedad no encontrada');
  const { resource, reload } = useAsync(() => getDiseaseDetail(diseaseId, scope), [diseaseId, scope]);

  if (!disease) return <NotFoundPage />;
  const scopeLabel = scope === 'ciudad' ? 'toda la ciudad' : regionName(scope);

  return (
    <>
      <Link to="/enfermedades" className="link mb-4 inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft className="size-4" aria-hidden="true" /> Volver al catálogo
      </Link>
      <PageHeader
        eyebrow={disease.kind === 'senal' ? 'Señal sindrómica' : 'Enfermedad'}
        title={disease.name}
        description={disease.description}
        meta={
          <>
            <Pill tone="forest">{categoryLabels[disease.category]}</Pill>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card card-keylime">
          <h2 className="flex items-center gap-2 text-[1.25rem]">
            <ShieldPlus className="size-5" aria-hidden="true" /> Prevención general
          </h2>
          <p className="mt-2 leading-relaxed">{disease.prevention}</p>
          <p className="mt-3 text-sm text-muted">Información general: no sustituye la orientación del personal de salud.</p>
        </div>
        <div className="card card-cream">
          <h2 className="text-[1.25rem]">Cómo se representa la vigilancia</h2>
          <p className="mt-2 leading-relaxed">{disease.monitoring}</p>
        </div>
      </div>

      <div className="mb-6 max-w-sm">
        <SelectField
          label="Ámbito"
          value={scope}
          onChange={(event) =>
            setParams(event.target.value === 'ciudad' ? {} : { zona: event.target.value }, { replace: true, preventScrollReset: true })
          }
          hint="Toda la ciudad o una zona amplia."
        >
          <option value="ciudad">Toda la ciudad</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </SelectField>
      </div>

      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={4} />}>
        {(data) => {
          const { signal } = data;
          const n = data.series.length;
          const windowFrom = n - SIGNAL_CRITERIA.windowWeeks;
          const baselineFrom = windowFrom - SIGNAL_CRITERIA.baselineWeeks;
          const first = data.series[0];
          const last = data.series[n - 1];
          const seriesRange = first && last ? `${first.label}–${last.label.replace('SE ', '')} (${formatDate(first.start)} – ${formatDate(last.end)})` : '';
          return (
            <div className="space-y-12">
              <section aria-labelledby="tendencia">
                <SectionHeading
                  id="tendencia"
                  title={`Tendencia semanal en ${scopeLabel}`}
                  description={`Registros por semana epidemiológica · ${seriesRange}. Corte: ${formatDate(data.cutoff)}.`}
                />
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
                  <div className="min-w-0 rounded-card border border-border-mist p-3 sm:p-4">
                    <TrendChart
                      title={`Registros de ${disease.name} en ${scopeLabel}`}
                      description={`Serie semanal de ${n} semanas. Último valor: ${data.series[n - 1]?.value ?? 0} registros.`}
                      points={data.series}
                      unitLabel="registros"
                      windowFrom={windowFrom}
                      baseline={
                        signal.status !== 'insuficiente' || signal.baselineWeeklyMean > 0
                          ? {
                              from: baselineFrom,
                              to: windowFrom - 1,
                              mean: signal.baselineWeeklyMean,
                              label: `Línea base ${formatDecimal(signal.baselineWeeklyMean)}`,
                            }
                          : undefined
                      }
                      threshold={
                        signal.baselineWeeklyMean > 0
                          ? {
                              value: signal.baselineWeeklyMean * SIGNAL_CRITERIA.thresholdRatio,
                              from: windowFrom,
                              label: `Umbral ${formatDecimal(SIGNAL_CRITERIA.thresholdRatio)}×`,
                            }
                          : undefined
                      }
                    />
                    <p className="mt-2 px-1 text-xs text-muted">
                      Eje vertical: registros por semana. Sombreado verde: ventana evaluada. Línea azul: línea base (promedio semanal).
                      Línea discontinua: umbral semanal equivalente.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-card bg-keylime-wash p-4">
                      <p className="text-sm text-muted">Regla de señal en {scopeLabel}</p>
                      <div className="mt-2">
                        <SignalBadge status={signal.status} ratio={signal.ratio} />
                      </div>
                      <dl className="mt-3 space-y-1.5 text-sm">
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted">Ventana ({signal.windowLabel})</dt>
                          <dd className="font-semibold tabular-nums">{formatInteger(signal.windowTotal)}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted">Esperado según línea base</dt>
                          <dd className="font-semibold tabular-nums">{formatDecimal(signal.expected)}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted">Razón</dt>
                          <dd className="font-semibold tabular-nums">{formatRatio(signal.ratio)}</dd>
                        </div>
                      </dl>
                      <p className="mt-2 text-xs text-muted">Línea base: {signal.baselineLabel}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section aria-labelledby="criterios" className="card card-mint">
                <SectionHeading id="criterios" title="Criterios de la señal" as="h2" />
                <SignalCriteria />
              </section>

              <section aria-labelledby="comparacion" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <SectionHeading id="comparacion" title="Comparación de periodos" as="h2" />
                  <BarList
                    ariaLabel="Comparación de periodos de 4 semanas"
                    highlightMode
                    items={[
                      {
                        id: 'actual',
                        label: `Últimas 4 semanas · ${data.comparison.current.label}`,
                        value: data.comparison.current.total,
                        emphasis: true,
                      },
                      { id: 'previo', label: `4 semanas previas · ${data.comparison.previous.label}`, value: data.comparison.previous.total },
                      { id: 'anio', label: data.comparison.lastYear.label, value: data.comparison.lastYear.total },
                    ]}
                  />
                  <p className="mt-3 text-sm text-muted">
                    Cambio frente a las 4 semanas previas:{' '}
                    <span className="font-semibold text-charcoal">
                      {formatSignedPercentChange(data.comparison.current.total, data.comparison.previous.total)}
                    </span>
                    . Una variación de registros no equivale a incidencia clínica.
                  </p>
                </div>
                <div className="min-w-0">
                  <h2 className="mb-5 text-[1.75rem] sm:text-[2rem]">Datos semanales</h2>
                  <div className="relative max-h-96 overflow-auto rounded-card border border-border-mist" tabIndex={0} aria-label="Tabla de datos semanales, desplazable">
                    <table className="table-base">
                      <caption className="sr-only">
                        Registros por semana de {disease.name} en {scopeLabel}
                      </caption>
                      <thead className="sticky top-0 bg-cream-paper">
                        <tr>
                          <th scope="col">Semana</th>
                          <th scope="col">Fechas</th>
                          <th scope="col" className="text-right">
                            Registros
                          </th>
                        </tr>
                      </thead>
                      <tbody className="tabular-nums">
                        {[...data.series].reverse().map((point, index) => (
                          <tr key={point.weekId}>
                            <th scope="row" className="font-medium">
                              {point.label}
                              {index < SIGNAL_CRITERIA.windowWeeks && <span className="ml-1.5 text-xs font-normal text-muted">(ventana)</span>}
                            </th>
                            <td className="text-muted">
                              {formatDate(point.start)} – {formatDate(point.end)}
                            </td>
                            <td className="text-right font-semibold">{formatInteger(point.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {scope === 'ciudad' && (
                <section aria-labelledby="por-zona">
                  <SectionHeading
                    id="por-zona"
                    title="Por zona"
                    description="Mismos criterios aplicados a cada zona. Con conteos bajos, la regla suele marcar «datos insuficientes»."
                  />
                  <div className="relative overflow-x-auto rounded-card border border-border-mist" tabIndex={0} aria-label="Tabla por zona, desplazable">
                    <table className="table-base min-w-[40rem]">
                      <caption className="sr-only">Registros de {disease.name} por zona, últimas 4 semanas</caption>
                      <thead>
                        <tr>
                          <th scope="col">Zona</th>
                          <th scope="col" className="text-right">
                            Últimas 4 sem.
                          </th>
                          <th scope="col">Cambio</th>
                          <th scope="col">Regla de señal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.zones.map((zone) => (
                          <tr key={zone.regionId}>
                            <th scope="row" className="font-medium">
                              <Link className="link" to={`?zona=${zone.regionId}`} replace preventScrollReset>
                                {regionName(zone.regionId)}
                              </Link>
                            </th>
                            <td className="text-right font-semibold tabular-nums">{formatInteger(zone.last4)}</td>
                            <td>
                              <ChangeText current={zone.last4} previous={zone.previous4} />
                            </td>
                            <td>
                              <SignalBadge status={zone.status} ratio={zone.ratio} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {data.vectorSeries && (
                <section aria-labelledby="vectorial">
                  <SectionHeading
                    id="vectorial"
                    eyebrow="Vigilancia del mosquito"
                    title="Vigilancia entomológica"
                    description={`Porcentaje de ovitrampas con huevos de mosquito en ${scopeLabel}. Umbral: ${VECTOR_THRESHOLD_PCT} %.`}
                  />
                  <div className="rounded-card border border-border-mist p-3 sm:p-4">
                    <TrendChart
                      title={`Ovitrampas positivas en ${scopeLabel} (referencia)`}
                      description="Porcentaje semanal de ovitrampas con huevos de mosquito."
                      points={data.vectorSeries}
                      unitLabel="% de ovitrampas positivas"
                      color="#9a6b00"
                      valueFormatter={(value) => `${formatDecimal(value)} %`}
                      threshold={{ value: VECTOR_THRESHOLD_PCT, from: 0, label: `Umbral ${VECTOR_THRESHOLD_PCT} %` }}
                      height={220}
                    />
                  </div>
                  <Notice tone="info" className="mt-3">
                    Una ovitrampa positiva indica huevos de mosquito en ese punto de muestreo. No equivale a casos ni a riesgo
                    individual.
                  </Notice>
                </section>
              )}

              <SourceMeta source={data.source} />
            </div>
          );
        }}
      </AsyncContent>
    </>
  );
}
