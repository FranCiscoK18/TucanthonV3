import { BadgeCheck, Globe, MapPin, Search, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataKindBadge, DemoBadge } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/Feedback';
import { Field } from '../components/ui/Form';
import { NoCommissionNote } from '../components/ui/NoCommission';
import { PageHeader, SourceNote } from '../components/ui/Layout';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { modalityLabels, providerTypeLabels, weekdayLabels } from '../mocks/doctors';
import { regionName } from '../mocks/regions';
import { sourceById } from '../mocks/sources';
import { healthProblems, searchDoctors, specialties, type DirectoryFilters } from '../services/directoryService';
import type { Doctor, Modality } from '../types';
import { DEMO_CUTOFF_DATE } from '../utils/dates';
import { formatCurrency } from '../utils/format';

const EMPTY: DirectoryFilters = { query: '', specialty: 'todas', healthProblem: 'todos', maxPrice: null, modality: 'todas', weekday: 'cualquiera' };

export default function Directory() {
  useDocumentTitle('Directorio de servicios de salud');
  const [filters, setFilters] = useState<DirectoryFilters>(EMPTY);
  const { data, loading, error, reload } = useAsync(
    () => searchDoctors(filters),
    [filters.query, filters.specialty, filters.healthProblem, filters.maxPrice, filters.modality, filters.weekday],
  );
  const set = <K extends keyof DirectoryFilters>(k: K, v: DirectoryFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <>
      <PageHeader
        eyebrow="Directorio"
        title="Servicios de salud"
        description="Médicos, consultorios y clínicas con perfiles y credenciales simuladas. Busca por especialidad, problema de salud, precio, modalidad y disponibilidad."
      />
      <NoCommissionNote />

      <section aria-label="Búsqueda y filtros del directorio" className="mt-6 rounded-[14px] bg-paper p-4 md:p-5">
        <Field id="d-buscar" label="Buscar por nombre, especialidad o problema de salud">
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="d-buscar"
              type="search"
              className="input pl-9"
              placeholder="Ej. fiebre, pediatría"
              value={filters.query}
              onChange={(e) => set('query', e.target.value)}
            />
          </div>
        </Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Field id="d-esp" label="Especialidad">
            <select id="d-esp" className="input" value={filters.specialty} onChange={(e) => set('specialty', e.target.value)}>
              <option value="todas">Todas</option>
              {specialties.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field id="d-prob" label="Problema de salud">
            <select id="d-prob" className="input" value={filters.healthProblem} onChange={(e) => set('healthProblem', e.target.value)}>
              <option value="todos">Todos</option>
              {healthProblems.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field id="d-precio" label="Precio máximo">
            <select
              id="d-precio"
              className="input"
              value={filters.maxPrice ?? ''}
              onChange={(e) => set('maxPrice', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Cualquiera</option>
              <option value={300}>Hasta $300</option>
              <option value={500}>Hasta $500</option>
              <option value={800}>Hasta $800</option>
            </select>
          </Field>
          <Field id="d-mod" label="Modalidad">
            <select id="d-mod" className="input" value={filters.modality} onChange={(e) => set('modality', e.target.value as Modality | 'todas')}>
              <option value="todas">Presencial o en línea</option>
              <option value="presencial">Presencial</option>
              <option value="en_linea">En línea</option>
            </select>
          </Field>
          <Field id="d-dia" label="Disponibilidad">
            <select
              id="d-dia"
              className="input"
              value={filters.weekday}
              onChange={(e) => set('weekday', e.target.value === 'cualquiera' ? 'cualquiera' : Number(e.target.value))}
            >
              <option value="cualquiera">Cualquier día</option>
              {weekdayLabels.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <LoadingState rows={6} label="Buscando servicios DEMO…" />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : !data?.length ? (
          <EmptyState
            icon={Stethoscope}
            title="Sin servicios con esos filtros"
            description="Amplía el precio, cambia la modalidad o prueba con otro problema de salud."
            action={
              <button type="button" className="btn btn-secondary" onClick={() => setFilters(EMPTY)}>
                Limpiar filtros
              </button>
            }
          />
        ) : (
          <>
            <p className="mb-3 text-[14px] text-muted">{data.length} resultados DEMO</p>
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.map((d) => (
                <li key={d.id}>
                  <DoctorCard doctor={d} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <SourceNote source={sourceById('src-directorio')} cutoffDate={DEMO_CUTOFF_DATE} />
    </>
  );
}

function DoctorCard({ doctor: d }: { doctor: Doctor }) {
  return (
    <article className="card flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill bg-keylime text-forest">{providerTypeLabels[d.providerType]}</span>
        <DataKindBadge kind="simulado" short />
      </div>
      <h2 className="mt-3 text-[19px] font-semibold leading-snug text-forest">{d.name}</h2>
      <p className="text-[14.5px]">{d.specialty}</p>
      <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
        <BadgeCheck aria-hidden className="h-4 w-4" />
        Credencial simulada {d.credential} <DemoBadge className="!px-2 !py-0 text-[11px]" />
      </p>
      <ul className="mt-3 space-y-1 text-[14px]">
        <li className="flex items-center gap-2">
          <MapPin aria-hidden className="h-4 w-4 text-muted" />
          Zona {regionName(d.regionId)}
        </li>
        <li className="flex items-center gap-2">
          <Globe aria-hidden className="h-4 w-4 text-muted" />
          {d.modalities.map((m) => modalityLabels[m]).join(' · ')}
        </li>
      </ul>
      <p className="mt-3 text-[13px] text-muted">{d.healthProblems.join(' · ')}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[18px] font-semibold text-ink">
          {formatCurrency(d.priceMxn)}
          <span className="text-[12.5px] font-normal text-muted"> por consulta (DEMO)</span>
        </p>
      </div>
      <div className="mt-auto pt-4">
        <NoCommissionNote />
        <Link to={`/directorio/${d.id}`} className="btn btn-secondary btn-sm mt-3 w-full">
          Ver perfil y horarios
        </Link>
      </div>
    </article>
  );
}
