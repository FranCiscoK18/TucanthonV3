import { ArrowLeft, BadgeCheck, CalendarClock, Languages, MapPin, Video } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { BookButton } from '../components/BookButton';
import { ScheduleTable } from '../components/ScheduleTable';
import { DirectoryNotice } from '../components/DirectoryNotice';
import { DataKindBadge, DemoTag, Pill } from '../components/ui/Badges';
import { PageHeader, SectionHeading } from '../components/ui/PageHeader';
import { AsyncContent, LoadingState } from '../components/ui/States';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { modalityLabels } from '../mocks/activities';
import { providerTypeLabels } from '../mocks/doctors';
import { getDoctor } from '../services/directoryService';
import { formatDateLong } from '../utils/dates';
import { formatMXN } from '../utils/format';

export function DoctorProfilePage() {
  const { doctorId = '' } = useParams();
  const { resource, data, reload } = useAsync(() => getDoctor(doctorId), [doctorId]);
  useDocumentTitle(data?.doctor.name ?? 'Perfil del directorio');

  return (
    <>
      <Link to="/directorio" className="link mb-4 inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft className="size-4" aria-hidden="true" /> Volver al directorio
      </Link>
      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={4} />} errorTitle="No pudimos cargar este perfil">
        {({ doctor, next }) => (
          <>
            <PageHeader
              eyebrow={providerTypeLabels[doctor.providerType]}
              title={doctor.name}
              description={doctor.bio}
              meta={
                <>
                  <Pill tone="forest">{doctor.specialty}</Pill>
                  <DataKindBadge kind="simulado" compact />
                  <DemoTag />
                </>
              }
              actions={<BookButton doctorId={doctor.id} doctorName={doctor.name} />}
            />
            <DirectoryNotice className="mb-8" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <section aria-labelledby="horarios">
                <SectionHeading id="horarios" title="Horarios" description="Horario semanal simulado. Los horarios ocupados se calculan al agendar." />
                <ScheduleTable doctor={doctor} />
                {next && (
                  <p className="mt-4 flex items-center gap-2 text-[0.9375rem]">
                    <CalendarClock className="size-4 text-muted" aria-hidden="true" />
                    Próximo horario disponible: <span className="font-medium first-letter:uppercase">{formatDateLong(next.date)}</span>, {next.time} h
                  </p>
                )}
              </section>
              <aside className="card card-keylime h-fit space-y-4" aria-label="Datos del servicio">
                <div className="flex gap-3">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted">Credencial</p>
                    <p className="font-medium">{doctor.credential}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted">Ubicación</p>
                    <p className="font-medium">{doctor.locationHint}</p>
                    <p className="text-sm text-muted">El directorio no publica direcciones exactas en la DEMO.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Video className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted">Modalidad</p>
                    <p className="font-medium">{doctor.modalities.map((modality) => modalityLabels[modality]).join(' y ')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Languages className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-muted">Idiomas</p>
                    <p className="font-medium">{doctor.languages.join(', ')}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted">Problemas de salud que atiende</p>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {doctor.healthTopics.map((topic) => (
                      <li key={topic} className="rounded-full bg-cream-paper px-2.5 py-1 text-sm">
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-[1.0625rem]">
                  <span className="font-semibold">{formatMXN(doctor.priceMXN)}</span>{' '}
                  <span className="text-sm text-muted">por consulta (precio simulado)</span>
                </p>
              </aside>
            </div>
          </>
        )}
      </AsyncContent>
    </>
  );
}
