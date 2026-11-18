import { CalendarDays, ExternalLink, EyeOff, Video } from 'lucide-react';
import { useSession } from '../app/session';
import { ScheduleTable } from '../components/ScheduleTable';
import { DataKindBadge, DemoTag, Pill } from '../components/ui/Badges';
import { ButtonLink } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';
import { PageHeader, SectionHeading } from '../components/ui/PageHeader';
import { AsyncContent, EmptyState, LoadingState } from '../components/ui/States';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { modalityLabels } from '../mocks/activities';
import { doctorById, LINKED_DOCTOR_ID } from '../mocks/doctors';
import { getDoctorAgenda } from '../services/appointmentService';
import type { Appointment } from '../types';
import { formatDateLong } from '../utils/dates';
import { formatMXN } from '../utils/format';

function groupByDate(appointments: Appointment[]): Array<[string, Appointment[]]> {
  const groups = new Map<string, Appointment[]>();
  for (const appointment of appointments) {
    if (appointment.status !== 'confirmada') continue;
    groups.set(appointment.date, [...(groups.get(appointment.date) ?? []), appointment]);
  }
  return [...groups.entries()];
}

export function DoctorPanelPage() {
  useDocumentTitle('Mi perfil y agenda');
  const { session } = useSession();
  const doctorId = session?.linkedDoctorId ?? LINKED_DOCTOR_ID;
  const doctor = doctorById.get(doctorId);
  const { resource, reload } = useAsync(() => getDoctorAgenda(doctorId), [doctorId]);

  if (!doctor) {
    return <EmptyState title="Perfil no encontrado" description="La sesión DEMO no está vinculada a un perfil del directorio." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Perfil profesional DEMO"
        title="Mi perfil y agenda"
        description={`Sesión vinculada a ${doctor.name}, un perfil ficticio del directorio.`}
        meta={
          <>
            <DataKindBadge kind="simulado" compact />
            <DemoTag />
          </>
        }
        actions={
          <ButtonLink to={`/directorio/${doctor.id}`} variant="secondary" icon={ExternalLink}>
            Ver mi perfil público
          </ButtonLink>
        }
      />

      <Notice tone="privacy" icon={EyeOff} className="mb-8">
        Este rol no ve reportes ciudadanos individuales. La agenda DEMO no contiene nombres ni datos de pacientes: cada cita
        se identifica solo con su folio.
      </Notice>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="agenda">
          <SectionHeading id="agenda" title="Próximas citas" description="Citas de ejemplo y citas DEMO agendadas desde este navegador." />
          <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={3} />}>
            {(appointments) => {
              const groups = groupByDate(appointments);
              return groups.length === 0 ? (
                <EmptyState title="Sin citas próximas" description="Cuando la ciudadanía agende contigo en la DEMO, aparecerán aquí." />
              ) : (
                <ol className="space-y-5">
                  {groups.map(([date, items]) => (
                    <li key={date}>
                      <h3 className="flex items-center gap-2 text-[1.25rem] first-letter:uppercase">
                        <CalendarDays className="size-5" aria-hidden="true" />
                        {formatDateLong(date)}
                      </h3>
                      <ul className="mt-2 divide-y divide-border-mist rounded-card border border-border-mist">
                        {items.map((appointment) => (
                          <li key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                            <span className="text-[1.125rem] font-semibold tabular-nums">{appointment.time} h</span>
                            <span className="inline-flex items-center gap-1.5 text-sm">
                              <Video className="size-4 text-muted" aria-hidden="true" />
                              {modalityLabels[appointment.modality]}
                            </span>
                            <span className="font-mono text-sm text-muted">{appointment.folio}</span>
                            <Pill tone={appointment.origin === 'propia' ? 'blue' : 'neutral'}>
                              {appointment.origin === 'propia' ? 'Agendada en este navegador' : 'Ejemplo'}
                            </Pill>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              );
            }}
          </AsyncContent>
        </section>

        <aside className="space-y-4">
          <div className="card card-keylime">
            <p className="text-sm text-muted">{doctor.specialty}</p>
            <h2 className="text-[1.5rem]">{doctor.name}</h2>
            <p className="mt-2 text-sm">{doctor.credential}</p>
            <p className="mt-2 text-sm">
              {formatMXN(doctor.priceMXN)} por consulta · {doctor.modalities.map((modality) => modalityLabels[modality]).join(' y ')}
            </p>
            <p className="mt-3 text-sm text-muted">
              Para editar el perfil en una versión real se requeriría verificación de credenciales con la autoridad competente.
            </p>
          </div>
        </aside>
      </div>

      <section aria-labelledby="horario" className="mt-12">
        <SectionHeading id="horario" title="Horario semanal" />
        <ScheduleTable doctor={doctor} />
      </section>
    </>
  );
}
