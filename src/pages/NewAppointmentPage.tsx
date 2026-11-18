import { ArrowLeft, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { DirectoryNotice } from '../components/DirectoryNotice';
import { DataKindBadge, DemoTag } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import { FormErrorSummary, RadioCards, SelectField } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { PageHeader } from '../components/ui/PageHeader';
import { ErrorState, LoadingState } from '../components/ui/States';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { modalityLabels } from '../mocks/activities';
import { getDemoClock } from '../mocks/clock';
import { doctorById, doctors } from '../mocks/doctors';
import { createAppointment, validateAppointment, type NewAppointmentInput } from '../services/appointmentService';
import { ValidationError } from '../services/client';
import { BOOKING_WINDOW_DAYS, getDaySlots, slotsForDay } from '../services/directoryService';
import type { CareModality } from '../types';
import { cx } from '../utils/cx';
import { addDays, formatDateLong, weekdayOf } from '../utils/dates';
import { formatMXN } from '../utils/format';

const SHORT_DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

function Step({ number, title, done, disabled, children }: { number: number; title: string; done: boolean; disabled: boolean; children: () => ReactNode }) {
  return (
    <section
      aria-labelledby={`paso-${number}`}
      className={cx('rounded-card border p-4 sm:p-6', disabled ? 'border-dashed border-line/60' : 'border-border-mist bg-cream-paper')}
    >
      <h2 id={`paso-${number}`} className={cx('flex items-center gap-3 text-[1.375rem]', disabled && 'text-muted')}>
        <span
          className={cx(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-full font-sans text-sm font-semibold',
            done ? 'bg-forest-ink text-cream-paper' : 'bg-keylime-wash text-forest-ink',
          )}
          aria-hidden="true"
        >
          {done ? '✓' : number}
        </span>
        <span>
          <span className="sr-only">Paso {number}: </span>
          {title}
          {done && <span className="sr-only"> (completado)</span>}
          {disabled && <span className="sr-only"> (disponible al completar el paso anterior)</span>}
        </span>
      </h2>
      {!disabled && <div className="mt-4">{children()}</div>}
    </section>
  );
}

export function NewAppointmentPage() {
  useDocumentTitle('Agendar una cita');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialDoctor = params.get('servicio');
  const [doctorId, setDoctorId] = useState(initialDoctor && doctorById.has(initialDoctor) ? initialDoctor : '');
  const doctor = doctorById.get(doctorId);
  const [modality, setModality] = useState<CareModality | ''>(doctor?.modalities.length === 1 ? (doctor.modalities[0] ?? '') : '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const { today } = getDemoClock();

  const days = useMemo(
    () =>
      Array.from({ length: BOOKING_WINDOW_DAYS }, (_, offset) => {
        const day = addDays(today, offset);
        const free = doctor && modality ? slotsForDay(doctor, day, modality).filter((slot) => slot.available).length : 0;
        return { day, free };
      }),
    [doctor, modality, today],
  );

  const slots = useAsync(
    () => (doctor && modality && date ? getDaySlots(doctor.id, date, modality) : Promise.resolve([])),
    [doctorId, modality, date],
  );

  const chooseDoctor = (id: string) => {
    setDoctorId(id);
    const next = doctorById.get(id);
    setModality(next?.modalities.length === 1 ? (next.modalities[0] ?? '') : '');
    setDate('');
    setTime('');
    setErrors({});
  };

  const confirm = async () => {
    const input: NewAppointmentInput = { doctorId, modality, date, time };
    const found = validateAppointment(input);
    setErrors(found);
    setServiceError(null);
    if (Object.keys(found).length > 0) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSaving(true);
    try {
      const appointment = await createAppointment(input);
      navigate('/citas', { replace: true, state: { createdFolio: appointment.folio } });
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(error.fieldErrors);
        if (error.fieldErrors.time) {
          setTime('');
          slots.reload();
        }
        window.requestAnimationFrame(() => summaryRef.current?.focus());
      } else {
        setServiceError(error instanceof Error ? error.message : 'No se pudo agendar la cita.');
      }
    } finally {
      setSaving(false);
    }
  };

  const summaryErrors = (['doctorId', 'modality', 'date', 'time'] as const)
    .filter((field) => errors[field])
    .map((field) => ({ fieldId: `cita-${field}`, message: errors[field] ?? '' }));

  return (
    <>
      <Link to="/citas" className="link mb-4 inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft className="size-4" aria-hidden="true" /> Volver a mis citas
      </Link>
      <PageHeader
        eyebrow="Agenda DEMO"
        title="Agendar una cita"
        description="Elige el servicio, la fecha y un horario libre. No se piden datos personales: todo es simulado."
        meta={
          <>
            <DataKindBadge kind="simulado" compact />
            <DemoTag />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <FormErrorSummary ref={summaryRef} errors={summaryErrors} />

          <Step number={1} title="Servicio y modalidad" done={Boolean(doctor && modality)} disabled={false}>
            {() => (
              <>
            <div className="space-y-5">
              <SelectField
                id="cita-doctorId"
                label="Servicio del directorio"
                value={doctorId}
                error={errors.doctorId}
                onChange={(event) => chooseDoctor(event.target.value)}
              >
                <option value="">Selecciona un servicio</option>
                {doctors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.specialty} · {formatMXN(item.priceMXN)}
                  </option>
                ))}
              </SelectField>
              {doctor && (
                <div id="cita-modality" tabIndex={-1} className="outline-none">
                  <RadioCards
                    name="modalidad"
                    legend="Modalidad"
                    columns={2}
                    value={modality}
                    error={errors.modality}
                    onChange={(value) => {
                      setModality(value);
                      setDate('');
                      setTime('');
                    }}
                    options={doctor.modalities.map((value) => ({
                      value,
                      label: modalityLabels[value],
                      description: value === 'en-linea' ? 'Videollamada simulada' : doctor.locationHint,
                    }))}
                  />
                </div>
              )}
            </div>
              </>
            )}
          </Step>

          <Step number={2} title="Fecha" done={Boolean(date)} disabled={!doctor || !modality}>
            {() => (
              <>
            <div id="cita-date" tabIndex={-1} className="outline-none">
              <p className="mb-3 text-sm text-muted">Próximos {BOOKING_WINDOW_DAYS} días. Los días sin horarios libres aparecen desactivados.</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-7" role="group" aria-label="Fechas disponibles">
                {days.map(({ day, free }) => {
                  const selected = date === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={free === 0}
                      aria-pressed={selected}
                      aria-label={`${formatDateLong(day)}: ${free === 0 ? 'sin horarios libres' : `${free} horarios libres`}`}
                      onClick={() => {
                        setDate(day);
                        setTime('');
                      }}
                      className={cx(
                        'flex min-h-16 flex-col items-center justify-center rounded-[12px] border px-1 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-45',
                        selected ? 'border-forest-ink bg-forest-ink text-cream-paper' : 'border-line/60 bg-cream-paper hover:border-forest-ink',
                      )}
                    >
                      <span className="text-xs">{SHORT_DAYS[weekdayOf(day)]}</span>
                      <span className="text-[1.125rem] font-semibold">{Number(day.slice(8))}</span>
                      <span className={cx('text-[0.6875rem]', selected ? 'text-cream-paper' : 'text-muted')}>{free > 0 ? `${free} libres` : '—'}</span>
                    </button>
                  );
                })}
              </div>
              {errors.date && <p className="field-error">{errors.date}</p>}
            </div>
              </>
            )}
          </Step>

          <Step number={3} title="Horario" done={Boolean(time)} disabled={!date}>
            {() => (
              <>
            <div id="cita-time" tabIndex={-1} className="outline-none">
              {slots.resource.status === 'loading' ? (
                <LoadingState lines={1} label="Cargando horarios…" />
              ) : slots.resource.status === 'error' ? (
                <ErrorState error={slots.resource.error} onRetry={slots.reload} title="No se pudieron cargar los horarios" />
              ) : slots.resource.data.length === 0 ? (
                <p className="text-muted">No hay horarios para esta fecha. Elige otro día.</p>
              ) : (
                <>
                  <p className="mb-3 text-sm text-muted first-letter:uppercase">{formatDateLong(date)}</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="group" aria-label="Horarios">
                    {slots.resource.data.map((slot) => {
                      const selected = time === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          aria-pressed={selected}
                          aria-label={`${slot.time} horas${slot.available ? '' : ', ocupado'}`}
                          onClick={() => setTime(slot.time)}
                          className={cx(
                            'min-h-11 rounded-[10px] border text-[0.9375rem] font-medium tabular-nums transition-colors disabled:cursor-not-allowed disabled:border-dashed disabled:text-muted disabled:line-through disabled:opacity-60',
                            selected ? 'border-forest-ink bg-forest-ink text-cream-paper' : 'border-line/60 bg-cream-paper hover:border-forest-ink',
                          )}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              {errors.time && <p className="field-error">{errors.time}</p>}
            </div>
              </>
            )}
          </Step>

          <Step number={4} title="Confirmar" done={false} disabled={!time}>
            {() => (
              <>
            {doctor && modality && date && time && (
              <div className="space-y-4">
                <dl className="grid grid-cols-1 gap-3 rounded-[12px] bg-keylime-wash p-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-muted">Servicio</dt>
                    <dd className="font-medium">
                      {doctor.name} · {doctor.specialty}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">Modalidad</dt>
                    <dd className="font-medium">{modalityLabels[modality]}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">Fecha y hora</dt>
                    <dd className="font-medium first-letter:uppercase">
                      {formatDateLong(date)}, {time} h
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">Precio (simulado)</dt>
                    <dd className="font-medium">{formatMXN(doctor.priceMXN)}</dd>
                  </div>
                </dl>
                <DirectoryNotice />
                {serviceError && (
                  <Notice tone="caution" title="No se pudo agendar" role="alert">
                    {serviceError} Intenta de nuevo.
                  </Notice>
                )}
                <Button icon={CalendarCheck} loading={saving} onClick={confirm} className="w-full sm:w-auto">
                  Confirmar cita
                </Button>
              </div>
            )}
              </>
            )}
          </Step>
        </div>

        <aside className="space-y-4">
          <div className="card card-slate">
            <CheckCircle2 className="size-6 text-forest-ink" aria-hidden="true" />
            <h2 className="mt-2 text-[1.25rem]">Sin datos personales</h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed">
              La DEMO no pide nombre, teléfono ni motivo de consulta: el motivo de una consulta es un dato de salud sensible. La
              cita se guarda solo en este navegador.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
