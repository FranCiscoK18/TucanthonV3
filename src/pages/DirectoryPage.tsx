import { CalendarClock, Languages, MapPin, RotateCcw, Search, Video } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { BookButton } from '../components/BookButton';
import { DirectoryNotice } from '../components/DirectoryNotice';
import { DataKindBadge, DemoTag, Pill } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import { InputField, SelectField } from '../components/ui/Form';
import { PageHeader } from '../components/ui/PageHeader';
import { SourceMeta } from '../components/ui/SourceMeta';
import { AsyncContent, EmptyState, LoadingState } from '../components/ui/States';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { modalityLabels } from '../mocks/activities';
import { healthTopics, providerTypeLabels, specialties } from '../mocks/doctors';
import {
  defaultDirectoryFilters,
  searchDirectory,
  type AvailabilityFilter,
  type DirectoryEntry,
  type DirectoryFilters,
} from '../services/directoryService';
import { getDataSourcesSnapshot } from '../services/sourceService';
import type { CareModality } from '../types';
import { formatDateLong } from '../utils/dates';
import { formatMXN } from '../utils/format';

const PRICE_OPTIONS = [300, 500, 700, 900];

function DoctorCard({ entry }: { entry: DirectoryEntry }) {
  const { doctor, next } = entry;
  return (
    <article className="card card-cream flex h-full flex-col" aria-labelledby={`perfil-${doctor.id}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="forest">{providerTypeLabels[doctor.providerType]}</Pill>
        <DataKindBadge kind="simulado" compact />
      </div>
      <h3 id={`perfil-${doctor.id}`} className="mt-3 text-[1.375rem]">
        <Link className="hover:underline" to={`/directorio/${doctor.id}`}>
          {doctor.name}
        </Link>
      </h3>
      <p className="font-medium text-charcoal">{doctor.specialty}</p>
      <p className="mt-1 text-sm text-muted">{doctor.credential}</p>

      <ul className="mt-4 space-y-1.5 text-[0.9375rem]">
        <li className="flex gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          {doctor.locationHint}
        </li>
        <li className="flex gap-2">
          <Video className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          {doctor.modalities.map((modality) => modalityLabels[modality]).join(' y ')}
        </li>
        <li className="flex gap-2">
          <Languages className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          {doctor.languages.join(', ')}
        </li>
        <li className="flex gap-2">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          {next ? (
            <span>
              Próximo horario: <span className="font-medium first-letter:uppercase">{formatDateLong(next.date)}</span>, {next.time} h
            </span>
          ) : (
            <span className="text-muted">Sin horarios en los próximos 14 días</span>
          )}
        </li>
      </ul>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {doctor.healthTopics.map((topic) => (
          <span key={topic} className="rounded-full bg-border-mist px-2.5 py-1 text-xs text-charcoal">
            {topic}
          </span>
        ))}
      </div>

      <p className="mt-4 text-[1.0625rem]">
        <span className="font-semibold text-charcoal">{formatMXN(doctor.priceMXN)}</span>{' '}
        <span className="text-sm text-muted">por consulta (precio simulado)</span>
      </p>
      <DirectoryNotice className="mt-3" />
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
        <BookButton doctorId={doctor.id} doctorName={doctor.name} size="sm" />
        <Link className="link text-sm" to={`/directorio/${doctor.id}`}>
          Ver perfil y horarios<span className="sr-only"> de {doctor.name}</span>
        </Link>
      </div>
    </article>
  );
}

export function DirectoryPage() {
  useDocumentTitle('Directorio de salud');
  const [filters, setFilters] = useState<DirectoryFilters>(defaultDirectoryFilters);
  const { resource, data, reload } = useAsync(() => searchDirectory(filters), [filters]);
  const source = getDataSourcesSnapshot().find((item) => item.id === 'fuente-directorio');
  const changed = JSON.stringify(filters) !== JSON.stringify(defaultDirectoryFilters);
  const update = <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  return (
    <>
      <PageHeader
        eyebrow="Directorio informativo DEMO"
        title="Directorio de servicios de salud"
        description="Médicos, consultorios y clínicas ficticios para probar la búsqueda y la agenda. Las credenciales están simuladas."
        meta={
          <>
            <DataKindBadge kind="simulado" compact />
            <DemoTag />
          </>
        }
      />
      <DirectoryNotice className="mb-6 text-[0.9375rem]" />

      <form
        role="search"
        className="mb-6 grid grid-cols-1 gap-3 rounded-card bg-border-mist/60 p-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6"
        onSubmit={(event) => event.preventDefault()}
        aria-label="Buscar en el directorio"
      >
        <div className="relative">
          <InputField
            label="Buscar"
            type="search"
            value={filters.query}
            placeholder="Nombre, especialidad o tema"
            onChange={(event) => update('query', event.target.value)}
          />
          <Search className="pointer-events-none absolute right-3 top-[2.85rem] size-4 text-muted" aria-hidden="true" />
        </div>
        <SelectField label="Especialidad" value={filters.specialty} onChange={(event) => update('specialty', event.target.value)}>
          <option value="todas">Todas</option>
          {specialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </SelectField>
        <SelectField label="Problema de salud" value={filters.topic} onChange={(event) => update('topic', event.target.value)}>
          <option value="todos">Todos</option>
          {healthTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Precio máximo"
          value={filters.maxPrice === null ? '' : String(filters.maxPrice)}
          onChange={(event) => update('maxPrice', event.target.value ? Number(event.target.value) : null)}
        >
          <option value="">Cualquier precio</option>
          {PRICE_OPTIONS.map((price) => (
            <option key={price} value={price}>
              Hasta {formatMXN(price)}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Modalidad"
          value={filters.modality}
          onChange={(event) => update('modality', event.target.value as CareModality | 'todas')}
        >
          <option value="todas">Presencial o en línea</option>
          <option value="presencial">Presencial</option>
          <option value="en-linea">En línea</option>
        </SelectField>
        <SelectField
          label="Disponibilidad"
          value={filters.availability}
          onChange={(event) => update('availability', event.target.value as AvailabilityFilter)}
        >
          <option value="cualquiera">Cualquier fecha</option>
          <option value="hoy">Hoy</option>
          <option value="3-dias">Próximos 3 días</option>
          <option value="7-dias">Próximos 7 días</option>
        </SelectField>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {data ? `${data.length} ${data.length === 1 ? 'resultado' : 'resultados'}` : 'Buscando…'}
        </p>
        {changed && (
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => setFilters(defaultDirectoryFilters)}>
            Limpiar filtros
          </Button>
        )}
      </div>

      <h2 className="sr-only">Resultados del directorio</h2>
      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={3} />}>
        {(entries) =>
          entries.length === 0 ? (
            <EmptyState
              title="Sin resultados"
              description="Ningún servicio coincide con todos los filtros. Prueba ampliar el precio, la modalidad o la disponibilidad."
              action={
                <Button variant="secondary" onClick={() => setFilters(defaultDirectoryFilters)}>
                  Limpiar filtros
                </Button>
              }
            />
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {entries.map((entry) => (
                <li key={entry.doctor.id}>
                  <DoctorCard entry={entry} />
                </li>
              ))}
            </ul>
          )
        }
      </AsyncContent>

      {source && <SourceMeta source={source} className="mt-10" />}
    </>
  );
}
