/**
 * Directorio de servicios de salud (DEMO) y cálculo de horarios disponibles.
 * Ondara no cobra comisiones ni recibe pagos por referencias.
 */
import { STORAGE_KEYS } from '../config/demo';
import { getDemoClock } from '../mocks/clock';
import { doctorById, doctors, getSeedAppointments } from '../mocks/doctors';
import type { Appointment, AvailableSlot, CareModality, Doctor } from '../types';
import { addDays, cancunLocalToIso, weekdayOf } from '../utils/dates';
import { hashString } from '../utils/random';
import { NotFoundError, simulateRequest } from './client';
import { isAppointment } from './guards';
import { readStoredList } from './storage';

export type AvailabilityFilter = 'cualquiera' | 'hoy' | '3-dias' | '7-dias';

export interface DirectoryFilters {
  query: string;
  specialty: string | 'todas';
  topic: string | 'todos';
  maxPrice: number | null;
  modality: CareModality | 'todas';
  availability: AvailabilityFilter;
}

export const defaultDirectoryFilters: DirectoryFilters = {
  query: '',
  specialty: 'todas',
  topic: 'todos',
  maxPrice: null,
  modality: 'todas',
  availability: 'cualquiera',
};

/** Días hacia adelante en que se pueden agendar citas. */
export const BOOKING_WINDOW_DAYS = 14;

function toMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

function toTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** Citas que ocupan horarios: las de ejemplo y las guardadas en este navegador. */
export function bookedAppointments(): Appointment[] {
  return [...getSeedAppointments(), ...readStoredList(STORAGE_KEYS.appointments, isAppointment)].filter(
    (appointment) => appointment.status === 'confirmada',
  );
}

/** Ocupación simulada y determinista para que la agenda luzca realista. */
function simulatedBusy(doctorId: string, date: string, time: string): boolean {
  return hashString(`${doctorId}|${date}|${time}`) % 100 < 30;
}

/** Horarios de un día: libres u ocupados. Excluye horarios que ya pasaron. */
export function slotsForDay(doctor: Doctor, date: string, modality?: CareModality): AvailableSlot[] {
  const weekday = weekdayOf(date);
  const booked = bookedAppointments().filter((item) => item.doctorId === doctor.id && item.date === date);
  const now = Date.now();
  const slots: AvailableSlot[] = [];
  for (const block of doctor.schedule.filter((item) => item.weekday === weekday)) {
    if (modality && !block.modalities.includes(modality)) continue;
    for (let minute = toMinutes(block.start); minute + block.slotMinutes <= toMinutes(block.end); minute += block.slotMinutes) {
      const time = toTime(minute);
      const isPast = Date.parse(cancunLocalToIso(date, time)) <= now;
      if (isPast) continue;
      const taken = booked.some((item) => item.time === time) || simulatedBusy(doctor.id, date, time);
      slots.push({ time, modalities: block.modalities, available: !taken });
    }
  }
  return slots.sort((a, b) => a.time.localeCompare(b.time));
}

export function nextAvailable(doctor: Doctor, withinDays = BOOKING_WINDOW_DAYS): { date: string; time: string } | null {
  const { today } = getDemoClock();
  for (let offset = 0; offset < withinDays; offset += 1) {
    const date = addDays(today, offset);
    const slot = slotsForDay(doctor, date).find((item) => item.available);
    if (slot) return { date, time: slot.time };
  }
  return null;
}

export interface DirectoryEntry {
  doctor: Doctor;
  next: { date: string; time: string } | null;
}

const AVAILABILITY_DAYS: Record<Exclude<AvailabilityFilter, 'cualquiera'>, number> = { hoy: 1, '3-dias': 3, '7-dias': 7 };

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export async function searchDirectory(filters: DirectoryFilters): Promise<DirectoryEntry[]> {
  return simulateRequest(() => {
    const query = normalize(filters.query.trim());
    return doctors
      .filter((doctor) =>
        query
          ? normalize([doctor.name, doctor.specialty, ...doctor.healthTopics].join(' ')).includes(query)
          : true,
      )
      .filter((doctor) => filters.specialty === 'todas' || doctor.specialty === filters.specialty)
      .filter((doctor) => filters.topic === 'todos' || doctor.healthTopics.includes(filters.topic))
      .filter((doctor) => filters.maxPrice === null || doctor.priceMXN <= filters.maxPrice)
      .filter((doctor) => filters.modality === 'todas' || doctor.modalities.includes(filters.modality))
      .map((doctor) => ({ doctor, next: nextAvailable(doctor) }))
      .filter((entry) => {
        if (filters.availability === 'cualquiera') return true;
        if (!entry.next) return false;
        const { today } = getDemoClock();
        return entry.next.date < addDays(today, AVAILABILITY_DAYS[filters.availability]);
      })
      .sort((a, b) => a.doctor.name.localeCompare(b.doctor.name, 'es'));
  });
}

export async function getDoctor(id: string): Promise<DirectoryEntry> {
  return simulateRequest(() => {
    const doctor = doctorById.get(id);
    if (!doctor) throw new NotFoundError('No encontramos ese perfil en el directorio DEMO.');
    return { doctor, next: nextAvailable(doctor) };
  });
}

export async function getDaySlots(doctorId: string, date: string, modality: CareModality): Promise<AvailableSlot[]> {
  return simulateRequest(() => {
    const doctor = doctorById.get(doctorId);
    if (!doctor) throw new NotFoundError('No encontramos ese perfil en el directorio DEMO.');
    return slotsForDay(doctor, date, modality);
  });
}
