/**
 * Citas simuladas guardadas en este navegador. No se solicitan nombre, contacto
 * ni motivo de consulta: la DEMO no recopila datos personales ni de salud.
 */
import { STORAGE_KEYS } from '../config/demo';
import { getDemoClock } from '../mocks/clock';
import { doctorById, getSeedAppointments } from '../mocks/doctors';
import type { Appointment, CareModality } from '../types';
import { addDays, cancunLocalToIso, isValidISODate } from '../utils/dates';
import { newAppointmentFolio, newId } from '../utils/ids';
import { NotFoundError, ValidationError, simulateRequest } from './client';
import { BOOKING_WINDOW_DAYS, slotsForDay } from './directoryService';
import { isAppointment } from './guards';
import { readStoredList, writeStored } from './storage';

export interface NewAppointmentInput {
  doctorId: string;
  modality: CareModality | '';
  date: string;
  time: string;
}

function readOwnAppointments(): Appointment[] {
  return readStoredList(STORAGE_KEYS.appointments, isAppointment);
}

function writeOwnAppointments(appointments: Appointment[]): void {
  if (!writeStored(STORAGE_KEYS.appointments, appointments)) {
    throw new Error('No se pudo guardar en este navegador (almacenamiento local no disponible).');
  }
}

export function validateAppointment(input: NewAppointmentInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const doctor = doctorById.get(input.doctorId);
  if (!doctor) {
    errors.doctorId = 'Elige un servicio del directorio.';
    return errors;
  }
  if (!input.modality) errors.modality = 'Elige la modalidad.';
  else if (!doctor.modalities.includes(input.modality)) errors.modality = 'Este servicio no ofrece esa modalidad.';

  const { today } = getDemoClock();
  if (!input.date) errors.date = 'Elige una fecha.';
  else if (!isValidISODate(input.date)) errors.date = 'La fecha no es válida.';
  else if (input.date < today) errors.date = 'Elige una fecha futura.';
  else if (input.date > addDays(today, BOOKING_WINDOW_DAYS - 1)) {
    errors.date = `Solo se puede agendar dentro de los próximos ${BOOKING_WINDOW_DAYS} días.`;
  }

  if (!input.time) errors.time = 'Elige un horario disponible.';
  else if (!errors.date && input.modality && !errors.modality) {
    if (Date.parse(cancunLocalToIso(input.date, input.time)) <= Date.now()) {
      errors.time = 'Ese horario ya pasó. Elige uno futuro.';
    } else {
      const slot = slotsForDay(doctor, input.date, input.modality).find((item) => item.time === input.time);
      if (!slot) errors.time = 'Ese horario no existe para la modalidad elegida.';
      else if (!slot.available) errors.time = 'Ese horario ya está ocupado. Elige otro.';
    }
  }
  return errors;
}

export async function createAppointment(input: NewAppointmentInput): Promise<Appointment> {
  return simulateRequest(() => {
    const errors = validateAppointment(input);
    if (Object.keys(errors).length > 0 || !input.modality) throw new ValidationError(errors);
    const now = new Date();
    const appointment: Appointment = {
      id: newId('cita'),
      folio: newAppointmentFolio(now),
      doctorId: input.doctorId,
      modality: input.modality,
      date: input.date,
      time: input.time,
      status: 'confirmada',
      createdAt: now.toISOString(),
      origin: 'propia',
      isDemo: true,
    };
    writeOwnAppointments([...readOwnAppointments(), appointment]);
    return appointment;
  });
}

export async function listMyAppointments(): Promise<Appointment[]> {
  return simulateRequest(() =>
    readOwnAppointments().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
  );
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  return simulateRequest(() => {
    const appointments = readOwnAppointments();
    const target = appointments.find((item) => item.id === id);
    if (!target) throw new NotFoundError('No encontramos esa cita en este navegador.');
    const updated: Appointment = { ...target, status: 'cancelada' };
    writeOwnAppointments(appointments.map((item) => (item.id === id ? updated : item)));
    return updated;
  });
}

/** Agenda del perfil médico: citas de ejemplo y citas DEMO de este navegador, sin datos de pacientes. */
export async function getDoctorAgenda(doctorId: string): Promise<Appointment[]> {
  return simulateRequest(() => {
    const { today } = getDemoClock();
    return [...getSeedAppointments(), ...readOwnAppointments()]
      .filter((item) => item.doctorId === doctorId && item.date >= today)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  });
}
