import { ArrowRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Sparkline } from '../components/charts/Sparkline';
import { SignalCriteria } from '../components/SignalCriteria';
import { DataKindBadge, DemoTag, Pill } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import { InputField } from '../components/ui/Form';
import { PageHeader, SectionHeading } from '../components/ui/PageHeader';
import { ChangeText, SignalBadge } from '../components/ui/SignalBadge';
import { SourceMeta } from '../components/ui/SourceMeta';
import { AsyncContent, EmptyState, LoadingState } from '../components/ui/States';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { categoryLabels, categoryOrder, diseaseById } from '../mocks/diseases';
import { regionName } from '../mocks/regions';
import { getDiseaseCatalog } from '../services/epidemiologyService';
import type { DiseaseCategory } from '../types';
import { cx } from '../utils/cx';
import { formatDate } from '../utils/dates';
import { formatInteger, formatRatio } from '../utils/format';

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function DiseasesPage() {
  useDocumentTitle('Enfermedades y señales');
  const { resource, reload } = useAsync(getDiseaseCatalog, []);
  const [params, setParams] = useSearchParams();
  const categoryParam = params.get('clasificacion');
  const category: DiseaseCategory | 'todas' =
    categoryParam && categoryParam in categoryLabels ? (categoryParam as DiseaseCategory) : 'todas';
  const [query, setQuery] = useState('');

  const setCategory = (value: DiseaseCategory | 'todas') =>
    setParams(value === 'todas' ? {} : { clasificacion: value }, { replace: true, preventScrollReset: true });

  const chips = useMemo(() => [{ id: 'todas' as const, label: 'Todas' }, ...categoryOrder.map((id) => ({ id, label: categoryLabels[id] }))], []);

  return (
    <>
      <PageHeader
        eyebrow="Catálogo DEMO"
        title="Enfermedades y señales"
        description="Descripciones generales, tendencias simuladas y una regla de señal con criterios visibles. Nada de lo que aparece aquí es un diagnóstico."
        meta={
          <>
            <DataKindBadge kind="oficial-demo" compact />
            <DemoTag />
          </>
        }
      />

      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={5} />}>
        {(data) => {
          const filtered = data.items.filter(
            (item) =>
              (category === 'todas' || item.disease.category === category) &&
              (!query.trim() || normalize(`${item.disease.name} ${item.disease.summary}`).includes(normalize(query.trim()))),
          );
          const citySignals = data.items.filter((item) => item.signal.status === 'senal');
          return (
            <div className="space-y-14">
              <section aria-labelledby="senales" className="card card-mint">
                <SectionHeading
                  id="senales"
                  eyebrow="Regla estadística transparente"
                  title="Señales por incremento inusual"
                  description={`Evaluadas sobre registros oficiales DEMO con corte al ${formatDate(data.cutoff)}.`}
                />
                <SignalCriteria />
                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <h3 className="text-[1.25rem]">En toda la ciudad</h3>
                    {citySignals.length === 0 ? (
                      <p className="mt-2 text-muted">Ninguna enfermedad o señal cumple hoy la regla.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {citySignals.map((item) => (
                          <li key={item.disease.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-cream-paper p-3">
                            <Link className="link" to={`/enfermedades/${item.disease.id}`}>
                              {item.disease.name}
                            </Link>
                            <span className="text-sm text-muted tabular-nums">
                              {formatInteger(item.signal.windowTotal)} registros vs. {formatInteger(Math.round(item.signal.expected))} esperados (
                              {formatRatio(item.signal.ratio)})
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h3 className="text-[1.25rem]">Por zona</h3>
                    {data.zoneSignals.length === 0 ? (
                      <p className="mt-2 text-muted">Ninguna zona cumple hoy la regla.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {data.zoneSignals.map((signal) => (
                          <li
                            key={`${signal.diseaseId}-${signal.scope}`}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] bg-cream-paper p-3"
                          >
                            <Link className="link" to={`/enfermedades/${signal.diseaseId}?zona=${signal.scope}`}>
                              {diseaseById.get(signal.diseaseId)?.name} · {regionName(signal.scope)}
                            </Link>
                            <span className="text-sm text-muted tabular-nums">{formatRatio(signal.ratio)} la línea base</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </section>

              <section aria-labelledby="catalogo">
                <SectionHeading id="catalogo" title="Catálogo" description={`Serie disponible: ${data.seriesLabel}.`} />
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div role="group" aria-label="Filtrar por clasificación" className="flex flex-wrap gap-2">
                    {chips.map((chip) => {
                      const active = category === chip.id;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setCategory(chip.id)}
                          className={cx(
                            'min-h-10 rounded-full border px-4 text-sm font-medium transition-colors',
                            active ? 'border-forest-ink bg-forest-ink text-cream-paper' : 'border-line/60 bg-cream-paper text-charcoal hover:border-forest-ink',
                          )}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative w-full lg:max-w-xs">
                    <InputField
                      label="Buscar"
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Nombre o descripción"
                    />
                    <Search className="pointer-events-none absolute right-3 top-[2.85rem] size-4 text-muted" aria-hidden="true" />
                  </div>
                </div>

                <p className="sr-only" aria-live="polite">
                  {filtered.length} resultados
                </p>
                {filtered.length === 0 ? (
                  <EmptyState
                    title="Sin resultados"
                    description="Ninguna enfermedad o señal coincide con la búsqueda y la clasificación elegidas."
                    action={
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setQuery('');
                          setCategory('todas');
                        }}
                      >
                        Limpiar filtros
                      </Button>
                    }
                  />
                ) : (
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {filtered.map((item) => (
                      <li key={item.disease.id} className="card card-cream flex flex-col">
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill tone="forest">{categoryLabels[item.disease.category]}</Pill>
                          {item.disease.kind === 'senal' && <Pill tone="neutral">Señal sindrómica</Pill>}
                        </div>
                        <h3 className="mt-3 text-[1.5rem]">{item.disease.name}</h3>
                        <p className="mt-1 flex-1 leading-relaxed text-muted">{item.disease.summary}</p>
                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-sm text-muted">Últimas 4 semanas</p>
                            <p className="text-[1.5rem] font-semibold leading-tight text-charcoal">{formatInteger(item.last4)}</p>
                            <ChangeText current={item.last4} previous={item.previous4} />
                          </div>
                          <Sparkline values={item.sparkline} label={`Tendencia de 8 semanas de ${item.disease.name}, DEMO`} />
                        </div>
                        <div className="mt-3">
                          <SignalBadge status={item.signal.status} ratio={item.signal.ratio} />
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-mist pt-3 text-sm">
                          <Link className="link" to={`/normativa#${item.disease.sourceId}`}>
                            Fuente DEMO
                          </Link>
                          <Link
                            className="inline-flex min-h-10 items-center gap-1 font-semibold text-forest-ink hover:underline"
                            to={`/enfermedades/${item.disease.id}`}
                          >
                            Ver ficha y tendencia <ArrowRight className="size-4" aria-hidden="true" />
                            <span className="sr-only">de {item.disease.name}</span>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <SourceMeta source={data.source} />
            </div>
          );
        }}
      </AsyncContent>
    </>
  );
}
