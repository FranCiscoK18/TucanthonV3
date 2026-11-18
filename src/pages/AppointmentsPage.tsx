import { CalendarPlus, CalendarX2, Clock, Stethoscope, Video } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { DataKindBadge, DemoTag, Pill } from '../components/ui/Badges';
import { Button, ButtonLink } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Notice } from '../components/ui/Notice';
import { PageHeader, SectionHeading } from '../components/ui/PageHeader';
import { AsyncContent, EmptyState, LoadingState } from '../components/ui/States';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { modalityLabels } from '../mocks/activities';
import { getDemoClock } from '../mocks/clock';
import { doctorById } from '../mocks/doctors';
import { cancelAppointment, listMyAppointments } from '../services/appointmentService';
import type { Appointment } from '../types';
import { cancunLocalToIso, formatDateLong } from '../utils/dates';

function AppointmentCard({ appointment, onCancel }: { appointment: Appointment; onCancel?: () => void }) {
  const doctor = doctorById.get(appointment.doctorId);
  const cancelled = appointment.status === 'cancelada';
  return (
    <article className="card card-cream" aria-labelledby={`cita-${appointment.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Folio {appointment.folio}</p>
          <h3 id={`cita-${appointment.id}`} className="text-[1.375rem] first-letter:uppercase">
            {formatDateLong(appointment.date)}
          </h3>
        </div>
        <Pill tone={cancelled ? 'neutral' : 'forest'}>{cancelled ? 'Cancelada' : 'Confirmada'} · DEMO</Pill>
      </div>
      <ul className="mt-3 space-y-1.5">
        <li className="flex gap-2">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          {appointment.time} h
        </li>
        <li className="flex gap-2">
          <Stethoscope className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          {doctor ? (
            <Link className="link font-normal" to={`/directorio/${doctor.id}`}>
              {doctor.name} · {doctor.specialty}
            </Link>
          ) : (
            'Servicio no disponible'
          )}
        </li>
        <li className="flex gap-2">
          <Video className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          {modalityLabels[appointment.modality]}
        </li>
      </ul>
      {onCancel && !cancelled && (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" icon={CalendarX2} onClick={onCancel}>
            Cancelar cita
          </Button>
        </div>
      )}
    </article>
  );
}

export function AppointmentsPage() {
  useDocumentTitle('Mis citas');
  const location = useLocation();
  const createdFolio = (location.state as { createdFolio?: string } | null)?.createdFolio;
  const { resource, data, reload, mutate } = useAsync(listMyAppointments, []);
  const [toCancel, setToCancel] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const now = Date.now();

  const confirmCancel = async () => {
    if (!toCancel || !data) return;
    setCancelling(true);
    try {
      const updated = await cancelAppointment(toCancel.id);
      mutate(data.map((item) => (item.id === updated.id ? updated : item)));
      setMessage(`La cita ${updated.folio} se canceló y el horario quedó libre.`);
      setToCancel(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cancelar la cita.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Agenda DEMO"
        title="Mis citas"
        description="Citas simuladas guardadas solo en este navegador."
        meta={
          <>
            <DataKindBadge kind="simulado" compact />
            <DemoTag />
          </>
        }
        actions={
          <ButtonLink to="/citas/nueva" icon={CalendarPlus}>
            Agendar una cita
          </ButtonLink>
        }
      />
      <Notice tone="privacy" className="mb-6">
        La DEMO no pide nombre, contacto ni motivo de consulta. En un servicio real, cada consultorio te pediría sus propios
        datos con su aviso de privacidad.
      </Notice>
      {createdFolio && !message && (
        <Notice tone="tip" className="mb-6" role="status">
          Cita confirmada con folio {createdFolio}.
        </Notice>
      )}
      {message && (
        <Notice tone="tip" className="mb-6" role="status">
          {message}
        </Notice>
      )}

      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={3} />}>
        {(appointments) => {
          const upcoming = appointments.filter(
            (item) => item.status === 'confirmada' && Date.parse(cancunLocalToIso(item.date, item.time)) > now,
          );
          const others = appointments.filter((item) => !upcoming.includes(item)).reverse();
          if (appointments.length === 0) {
            return (
              <EmptyState
                headingLevel="h2"
                title="No tienes citas agendadas"
                description="Busca un servicio en el directorio y elige un horario disponible. Todo es simulado."
                action={
                  <>
                    <ButtonLink to="/citas/nueva" icon={CalendarPlus}>
                      Agendar una cita
                    </ButtonLink>
                    <ButtonLink to="/directorio" variant="secondary">
                      Ver el directorio
                    </ButtonLink>
                  </>
                }
              />
            );
          }
          return (
            <div className="space-y-10">
              <section aria-labelledby="proximas">
                <SectionHeading id="proximas" title="Próximas" as="h2" />
                {upcoming.length === 0 ? (
                  <p className="text-muted">No tienes citas próximas.</p>
                ) : (
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {upcoming.map((appointment) => (
                      <li key={appointment.id}>
                        <AppointmentCard appointment={appointment} onCancel={() => setToCancel(appointment)} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              {others.length > 0 && (
                <section aria-labelledby="historial">
                  <SectionHeading id="historial" title="Canceladas y pasadas" as="h2" />
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {others.map((appointment) => (
                      <li key={appointment.id}>
                        <AppointmentCard appointment={appointment} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          );
        }}
      </AsyncContent>

      <Dialog
        open={toCancel !== null}
        onClose={() => setToCancel(null)}
        title="¿Cancelar esta cita?"
        description={toCancel ? `${formatDateLong(toCancel.date)} a las ${toCancel.time} h · folio ${toCancel.folio}. El horario quedará libre.` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setToCancel(null)}>
              Conservar
            </Button>
            <Button variant="danger" icon={CalendarX2} loading={cancelling} onClick={confirmCancel}>
              Cancelar cita
            </Button>
          </>
        }
      />
      <p className="mt-10 text-sm text-muted">Fecha de hoy en la DEMO: {formatDateLong(getDemoClock().today)}.</p>
    </>
  );
}
