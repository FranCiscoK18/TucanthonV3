import { ArrowRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkline } from '../components/charts/Sparkline';
import { DataKindBadge } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { Field } from '../components/ui/Form';
import { PageHeader, SourceNote } from '../components/ui/Layout';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { diseaseCategoryLabels } from '../mocks/diseases';
import { sourceById } from '../mocks/sources';
import { getDiseases } from '../services/epidemiologyService';
import type { DiseaseCategory } from '../types';
import { DEMO_CUTOFF_DATE } from '../utils/dates';
import { formatNumber } from '../utils/format';
import { SIGNAL_DISCLAIMER } from '../utils/signals';

export default function Diseases() {
  useDocumentTitle('Enfermedades y señales');
  const { data, loading, error, reload } = useAsync(getDiseases, []);
  const [category, setCategory] = useState<DiseaseCategory | 'todas'>('todas');
  const [query, setQuery] = useState('');
  const [onlySignals, setOnlySignals] = useState(false);

  const filtered = useMemo(
    () =>
      (data ?? []).filter(
        (d) =>
          (category === 'todas' || d.disease.category === category) &&
          (!query.trim() || d.disease.name.toLowerCase().includes(query.trim().toLowerCase())) &&
          (!onlySignals || d.signal.triggered),
      ),
    [data, category, query, onlySignals],
  );

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Enfermedades y señales"
        description="Descripción general, tendencia de registros DEMO y señales por incremento inusual con criterios visibles. Ondara no diagnostica ni confirma brotes."
      />
      <Notice tone="info" title="Qué es una señal">
        {SIGNAL_DISCLAIMER}
      </Notice>

      <section aria-label="Filtros del catálogo" className="mt-6 grid gap-4 rounded-[14px] bg-paper p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end md:p-5">
        <Field id="buscar-enfermedad" label="Buscar">
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="buscar-enfermedad"
              type="search"
              className="input pl-9"
              placeholder="Ej. dengue"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </Field>
        <Field id="cat-enfermedad" label="Clasificación">
          <select id="cat-enfermedad" className="input" value={category} onChange={(e) => setCategory(e.target.value as DiseaseCategory | 'todas')}>
            <option value="todas">Todas</option>
            {(Object.keys(diseaseCategoryLabels) as DiseaseCategory[]).map((c) => (
              <option key={c} value={c}>
                {diseaseCategoryLabels[c]}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex min-h-[44px] items-center gap-2 text-[15px]">
          <input type="checkbox" className="h-4 w-4 accent-[#0f3e17]" checked={onlySignals} onChange={(e) => setOnlySignals(e.target.checked)} />
          Solo con señal activa
        </label>
      </section>

      <div className="mt-6">
        {loading ? (
          <LoadingState rows={6} />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            description="Ninguna enfermedad coincide con los filtros."
            action={
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setCategory('todas');
                  setQuery('');
                  setOnlySignals(false);
                }}
              >
                Limpiar filtros
              </button>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ disease, last4, signal, sparkline }) => (
              <li key={disease.id} className="card flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pill bg-keylime text-forest">{diseaseCategoryLabels[disease.category]}</span>
                  {signal.triggered && <span className="pill bg-caution-bg text-caution">Cambio sobre línea base</span>}
                </div>
                <h2 className="title-display mt-3 text-[30px]">{disease.name}</h2>
                <p className="mt-2 flex-1 text-[14.5px] text-ink">{disease.description}</p>
                <div className="mt-4 flex items-end justify-between gap-3 border-t border-hairline pt-4">
                  <div>
                    <DataKindBadge kind="oficial" short />
                    <p className="mt-2 text-[13px] text-muted">Últimas 4 semanas</p>
                    <p className="text-[22px] font-semibold tabular-nums text-forest">{formatNumber(last4)}</p>
                  </div>
                  <Sparkline values={sparkline} label={`Tendencia de 12 semanas de ${disease.name} (DEMO)`} />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <Link className="link" to={`/normativa#fuente-${disease.sourceId}`}>
                    Fuente: {sourceById(disease.sourceId)?.name}
                  </Link>
                  <Link to={`/enfermedades/${disease.id}`} className="btn btn-secondary btn-sm">
                    Ver detalle
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <SourceNote source={sourceById('src-oficial')} cutoffDate={DEMO_CUTOFF_DATE} />
    </>
  );
}
