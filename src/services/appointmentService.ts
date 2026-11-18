import { STORAGE_KEYS } from '../config/demo';
import { doctorById, doctorSchedules } from '../mocks/doctors';
import type { Appointment, Modality } from '../types';
import { addDays, parseLocalDate, todayIso } from '../utils/dates';
import { makeFolio, makeId } from '../utils/format';
import { simulate } from './client';
import { readJson, writeJson } from './storage';

function readAppointments(): Appointment[] {
  return readJson<Appointment[]>(STORAGE_KEYS.appointments, []);
}

/** Citas ocupadas por "otras personas" (DEMO, en memoria, sin datos personales). */
function seedBusy(doctorId: string, date: string): string[] {
  const day = parseLocalDate(date).getDate();
  const busy = ['09:30', '10:00', '16:30', '18:30', '08:40', '11:00'];
  return busy.filter((_, i) => (day + i + doctorId.length) % 3 === 0);
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
const toTime = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export interface Slot {
  time: string;
  available: boolean;
}

function slotsFor(doctorId: string, date: string, modality: Modality): Slot[] {
  const weekday = parseLocalDate(date).getDay();
  const taken = new Set([
    ...seedBusy(doctorId, date),
    ...readAppointments()
      .filter((a) => a.doctorId === doctorId && a.date === date && a.status === 'confirmada')
      .map((a) => a.time),
  ]);
  const slots: Slot[] = [];
  for (const s of doctorSchedules.filter((x) => x.doctorId === doctorId && x.weekday === weekday && x.modality === modality)) {
    for (let t = toMinutes(s.start); t + s.slotMinutes <= toMinutes(s.end); t += s.slotMinutes) {
      const time = toTime(t);
      slots.push({ time, available: !taken.has(time) });
    }
  }
  return slots;
}

export function getAvailableSlots(doctorId: string, date: string, modality: Modality): Promise<Slot[]> {
  return simulate(() => slotsFor(doctorId, date, modality));
}

/** Próximas fechas (14 días) en que el servicio atiende en esa modalidad. */
export function getAvailableDates(doctorId: string, modality: Modality): string[] {
  const days = new Set(doctorSchedules.filter((s) => s.doctorId === doctorId && s.modality === modality).map((s) => s.weekday));
  const out: string[] = [];
  for (let i = 1; i <= 14; i += 1) {
    const date = addDays(todayIso(), i);
    if (days.has(parseLocalDate(date).getDay())) out.push(date);
  }
  return out;
}

export interface BookingInput {
  doctorId: string;
  modality: Modality;
  date: string;
  time: string;
  reason: string;
}

export type BookingErrors = Partial<Record<keyof BookingInput, string>>;

export function validateBooking(input: Partial<BookingInput>): BookingErrors {
  const errors: BookingErrors = {};
  const doctor = input.doctorId ? doctorById(input.doctorId) : undefined;
  if (!doctor) errors.doctorId = 'Elige un servicio del directorio.';
  if (!input.modality) errors.modality = 'Elige la modalidad.';
  else if (doctor && !doctor.modalities.includes(input.modality)) errors.modality = 'Este servicio no ofrece esa modalidad.';
  if (!input.date) errors.date = 'Elige una fecha.';
  else if (input.date <= todayIso()) errors.date = 'La fecha debe ser futura.';
  if (!input.time) errors.time = 'Elige un horario disponible.';
  const reason = input.reason?.trim() ?? '';
  if (reason.length < 3) errors.reason = 'Indica un motivo general (sin detalles clínicos sensibles).';
  else if (reason.length > 120) errors.reason = 'Máximo 120 caracteres.';
  return errors;
}

export function bookAppointment(input: BookingInput): Promise<Appointment> {
  return simulate(() => {
    const errors = validateBooking(input);
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    const slot = slotsFor(input.doctorId, input.date, input.modality).find((s) => s.time === input.time);
    if (!slot || !slot.available) throw new Error('Ese horario ya no está libre. Elige otro.');
    const appointment: Appointment = {
      ...input,
      reason: input.reason.trim(),
      id: makeId('cita'),
      folio: makeFolio('CITA'),
      status: 'confirmada',
      createdAt: new Date().toISOString(),
      isDemo: true,
    };
    writeJson(STORAGE_KEYS.appointments, [appointment, ...readAppointments()]);
    return appointment;
  });
}

export function getMyAppointments(): Promise<Appointment[]> {
  return simulate(() => readAppointments().sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));
}

export function cancelAppointment(id: string): Promise<void> {
  return simulate(() => {
    writeJson(
      STORAGE_KEYS.appointments,
      readAppointments().map((a) => (a.id === id ? { ...a, status: 'cancelada' as const } : a)),
    );
  });
}

export interface AgendaItem {
  id: string;
  date: string;
  time: string;
  modality: Modality;
  label: string;
  origin: 'demo' | 'navegador';
}

/** Agenda del médico: citas DEMO de ejemplo + citas creadas en este navegador. Sin datos personales. */
export function getDoctorAgenda(doctorId: string): Promise<AgendaItem[]> {
  return simulate(() => {
    const items: AgendaItem[] = [];
    for (let i = 1; i <= 7; i += 1) {
      const date = addDays(todayIso(), i);
      for (const modality of ['presencial', 'en_linea'] as const) {
        for (const s of slotsFor(doctorId, date, modality)) {
          if (seedBusy(doctorId, date).includes(s.time)) {
            items.push({ id: `seed-${date}-${s.time}`, date, time: s.time, modality, label: 'Cita DEMO de ejemplo', origin: 'demo' });
          }
        }
      }
    }
    for (const a of readAppointments().filter((x) => x.doctorId === doctorId && x.status === 'confirmada')) {
      items.push({ id: a.id, date: a.date, time: a.time, modality: a.modality, label: `Folio ${a.folio}`, origin: 'navegador' });
    }
    return items.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  });
}
