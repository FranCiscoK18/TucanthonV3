import { CalendarCheck2, CalendarDays, CalendarX2, CheckCircle2, Clock, Globe, MapPin } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DemoBadge } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { Field, describedBy, fieldIds } from '../components/ui/Form';
import { NoCommissionNote } from '../components/ui/NoCommission';
import { PageHeader, Section } from '../components/ui/Layout';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { doctorById, doctors, modalityLabels } from '../mocks/doctors';
import {
  bookAppointment,
  cancelAppointment,
  getAvailableDates,
  getAvailableSlots,
  getMyAppointments,
  validateBooking,
  type BookingErrors,
  type BookingInput,
} from '../services/appointmentService';
import type { Appointment, Modality } from '../types';
import { formatLongDate, todayIso } from '../utils/dates';
import { formatCurrency } from '../utils/format';

const REASON_HINT = 'Ej. «revisión general». No incluyas datos clínicos sensibles ni personales.';

export default function Appointments() {
  useDocumentTitle('Mis citas');
  const [params] = useSearchParams();
  const preselected = params.get('servicio');
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (confirmed) confirmRef.current?.focus();
  }, [confirmed]);

  return (
    <>
      <PageHeader
        eyebrow="Agenda simulada"
        title="Mis citas"
        description="Agenda una cita presencial o en línea seleccionando un servicio de salud DEMO en el formulario. Las citas son simuladas y solo se guardan en este navegador."
      />
      <Notice tone="caution" title="Citas DEMO">
        Ninguna cita llega a un profesional real. No escribas datos personales ni información clínica sensible.
      </Notice>

      {confirmed ? (
        <div ref={confirmRef} tabIndex={-1} className="panel-sage mt-6 outline-none" role="status">
          <CheckCircle2 aria-hidden className="h-8 w-8 text-forest" />
          <p className="eyebrow mt-3">Cita confirmada (simulada)</p>
          <p className="title-display mt-1 text-[34px]">Folio {confirmed.folio}</p>
          <p className="mt-2 text-[15px]">
            {doctorById(confirmed.doctorId)?.name} · {formatLongDate(confirmed.date)} a las {confirmed.time} · {modalityLabels[confirmed.modality]}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={() => setConfirmed(null)}>
              Agendar otra cita
            </button>
            <a href="#mis-citas" className="btn btn-ghost bg-cream">
              Ver mis citas
            </a>
          </div>
        </div>
      ) : (
        <BookingForm
          key={preselected ?? 'nuevo'}
          initialDoctorId={preselected && doctorById(preselected) ? preselected : ''}
          onBooked={(a) => {
            setConfirmed(a);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      <MyAppointments refreshKey={refreshKey} />
    </>
  );
}

function BookingForm({ initialDoctorId, onBooked }: { initialDoctorId: string; onBooked: (a: Appointment) => void }) {
  const [form, setForm] = useState<Partial<BookingInput>>(() => {
    const d = initialDoctorId ? doctorById(initialDoctorId) : undefined;
    return { doctorId: initialDoctorId, modality: d?.modalities[0], date: '', time: '', reason: '' };
  });
  const [errors, setErrors] = useState<BookingErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const doctor = form.doctorId ? doctorById(form.doctorId) : undefined;
  const dates = useMemo(() => (form.doctorId && form.modality ? getAvailableDates(form.doctorId, form.modality) : []), [form.doctorId, form.modality]);
  const slots = useAsync(
    () => (form.doctorId && form.modality && form.date ? getAvailableSlots(form.doctorId, form.date, form.modality) : Promise.resolve([])),
    [form.doctorId, form.modality, form.date],
  );

  const set = <K extends keyof BookingInput>(k: K, v: BookingInput[K]) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === 'doctorId') {
        next.modality = doctorById(String(v))?.modalities[0];
        next.date = '';
        next.time = '';
      }
      if (k === 'modality') {
        next.date = '';
        next.time = '';
      }
      if (k === 'date') next.time = '';
      return next;
    });
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const v = validateBooking(form);
    setErrors(v);
    if (Object.keys(v).length) {
      const first = (['doctorId', 'modality', 'date', 'time', 'reason'] as const).find((k) => v[k]);
      if (first) document.getElementById(`cita-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      onBooked(await bookAppointment(form as BookingInput));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo agendar.');
      slots.reload();
    } finally {
      setSubmitting(false);
    }
  };

  const ids = {
    doctor: fieldIds('cita-doctorId'),
    reason: fieldIds('cita-reason'),
  };

  return (
    <form noValidate onSubmit={submit} className="card mt-6" aria-labelledby="nueva-cita">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="nueva-cita" className="title-display text-[30px]">
          Nueva cita
        </h2>
        <DemoBadge />
      </div>

      <ol className="mt-5 space-y-6">
        <li>
          <p className="eyebrow mb-3">1 · Servicio y modalidad</p>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Field id="cita-doctorId" label="Servicio de salud DEMO" required error={errors.doctorId}>
              <select
                id="cita-doctorId"
                className="input"
                value={form.doctorId ?? ''}
                onChange={(e) => set('doctorId', e.target.value)}
                aria-invalid={Boolean(errors.doctorId)}
                aria-describedby={describedBy(ids.doctor, undefined, errors.doctorId)}
              >
                <option value="">Elige un servicio…</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty} ({formatCurrency(d.priceMxn)})
                  </option>
                ))}
              </select>
            </Field>
            <fieldset aria-describedby={errors.modality ? 'cita-modality-error' : undefined}>
              <legend className="field-label">
                Modalidad <span className="font-normal text-muted">(obligatorio)</span>
              </legend>
              <div className="flex gap-2">
                {(['presencial', 'en_linea'] as Modality[]).map((m) => {
                  const offered = doctor?.modalities.includes(m) ?? false;
                  return (
                    <label
                      key={m}
                      className={`flex min-h-[44px] items-center gap-2 rounded-[10px] border px-3 text-[15px] ${
                        form.modality === m ? 'border-forest bg-keylime text-forest' : 'border-[#c9c7bf]'
                      } ${offered ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                    >
                      <input
                        id={m === 'presencial' ? 'cita-modality' : undefined}
                        type="radio"
                        name="modalidad"
                        className="accent-[#0f3e17]"
                        value={m}
                        disabled={!offered}
                        checked={form.modality === m}
                        onChange={() => set('modality', m)}
                      />
                      {m === 'presencial' ? <MapPin aria-hidden className="h-4 w-4" /> : <Globe aria-hidden className="h-4 w-4" />}
                      {modalityLabels[m]}
                    </label>
                  );
                })}
              </div>
              {errors.modality && (
                <p id="cita-modality-error" className="field-error" role="alert">
                  {errors.modality}
                </p>
              )}
            </fieldset>
          </div>
        </li>

        <li>
          <p className="eyebrow mb-3">2 · Fecha</p>
          {!doctor ? (
            <p className="text-[14.5px] text-muted">Elige primero un servicio.</p>
          ) : dates.length === 0 ? (
            <p className="text-[14.5px] text-muted">Sin fechas disponibles en los próximos 14 días para esta modalidad.</p>
          ) : (
            <fieldset>
              <legend className="sr-only">Fecha de la cita (próximos 14 días)</legend>
              <div className="flex flex-wrap gap-2">
                {dates.map((d, i) => (
                  <label
                    key={d}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-2 rounded-[10px] border px-3 text-[14.5px] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[#2c6b3a] ${
                      form.date === d ? 'border-forest bg-keylime font-medium text-forest' : 'border-[#c9c7bf] hover:bg-paper'
                    }`}
                  >
                    <input
                      id={i === 0 ? 'cita-date' : undefined}
                      type="radio"
                      name="fecha"
                      className="sr-only"
                      value={d}
                      checked={form.date === d}
                      onChange={() => set('date', d)}
                    />
                    <CalendarDays aria-hidden className="h-4 w-4" />
                    {formatLongDate(d)}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {errors.date && (
            <p className="field-error" role="alert">
              {errors.date}
            </p>
          )}
        </li>

        <li>
          <p className="eyebrow mb-3">3 · Horario disponible</p>
          {!form.date ? (
            <p className="text-[14.5px] text-muted">Elige una fecha para ver horarios.</p>
          ) : slots.loading ? (
            <LoadingState variant="list" rows={1} label="Consultando horarios…" />
          ) : slots.error ? (
            <ErrorState error={slots.error} onRetry={slots.reload} />
          ) : !slots.data?.length ? (
            <p className="text-[14.5px] text-muted">No hay horarios ese día.</p>
          ) : (
            <fieldset>
              <legend className="sr-only">Horario</legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
                {slots.data.map((s, i) => (
                  <label
                    key={s.time}
                    className={`flex min-h-[44px] items-center justify-center gap-1 rounded-[10px] border text-[14.5px] tabular-nums has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[#2c6b3a] ${
                      !s.available
                        ? 'cursor-not-allowed border-dashed border-[#c9c7bf] text-muted line-through'
                        : form.time === s.time
                          ? 'cursor-pointer border-forest bg-forest text-cream'
                          : 'cursor-pointer border-[#c9c7bf] hover:bg-paper'
                    }`}
                  >
                    <input
                      id={i === 0 ? 'cita-time' : undefined}
                      type="radio"
                      name="hora"
                      className="sr-only"
                      value={s.time}
                      disabled={!s.available}
                      checked={form.time === s.time}
                      onChange={() => set('time', s.time)}
                    />
                    <Clock aria-hidden className="h-3.5 w-3.5" />
                    {s.time}
                    {!s.available && <span className="sr-only"> (ocupado)</span>}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {errors.time && (
            <p className="field-error" role="alert">
              {errors.time}
            </p>
          )}
        </li>

        <li>
          <p className="eyebrow mb-3">4 · Confirmar</p>
          <Field
            id="cita-reason"
            label="Motivo general de la consulta"
            required
            hint={REASON_HINT}
            error={errors.reason}
          >
            <input
              id="cita-reason"
              className="input"
              maxLength={120}
              value={form.reason ?? ''}
              onChange={(e) => set('reason', e.target.value)}
              aria-invalid={Boolean(errors.reason)}
              aria-describedby={describedBy(ids.reason, REASON_HINT, errors.reason)}
            />
          </Field>
        </li>
      </ol>

      {submitError && (
        <Notice tone="danger" role="alert" className="mt-5" title="No se pudo agendar">
          {submitError}
        </Notice>
      )}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <NoCommissionNote />
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          <CalendarCheck2 aria-hidden className="h-4 w-4" />
          {submitting ? 'Confirmando…' : 'Confirmar cita'}
        </button>
      </div>
    </form>
  );
}

function MyAppointments({ refreshKey }: { refreshKey: number }) {
  const { data, loading, error, reload } = useAsync(getMyAppointments, [refreshKey]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const cancel = async (id: string) => {
    setBusyId(id);
    setCancelError(null);
    try {
      await cancelAppointment(id);
      reload();
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'No se pudo cancelar.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Section id="mis-citas" eyebrow="Guardadas en este navegador" title="Citas agendadas">
      {cancelError && (
        <Notice tone="danger" role="alert" className="mb-4">
          {cancelError}
        </Notice>
      )}
      {loading ? (
        <LoadingState variant="list" rows={2} />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState
          icon={CalendarDays}
          title="Aún no tienes citas"
          description="Usa el formulario de arriba para agendar una cita simulada."
        />
      ) : (
        <ul className="space-y-3">
          {data.map((a) => {
            const d = doctorById(a.doctorId);
            const past = a.date < todayIso();
            return (
              <li key={a.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-forest">
                    {d?.name ?? 'Servicio DEMO'} <span className="font-normal text-muted">· {d?.specialty}</span>
                  </p>
                  <p className="text-[14.5px]">
                    {formatLongDate(a.date)} · {a.time} · {modalityLabels[a.modality]}
                  </p>
                  <p className="text-[13px] text-muted">
                    Folio {a.folio} · Motivo: {a.reason}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`pill ${a.status === 'cancelada' ? 'bg-paper text-muted' : past ? 'bg-paper text-muted' : 'bg-success-bg text-success'}`}>
                    {a.status === 'cancelada' ? 'Cancelada' : past ? 'Pasada' : 'Confirmada'}
                  </span>
                  {a.status === 'confirmada' && !past && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => cancel(a.id)} disabled={busyId === a.id}>
                      <CalendarX2 aria-hidden className="h-4 w-4" />
                      {busyId === a.id ? 'Cancelando…' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
