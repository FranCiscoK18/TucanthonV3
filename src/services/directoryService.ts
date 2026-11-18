import { doctorById, doctors, doctorSchedules } from '../mocks/doctors';
import type { Doctor, DoctorSchedule, Modality } from '../types';
import { simulate } from './client';

export interface DirectoryFilters {
  query: string;
  specialty: string | 'todas';
  healthProblem: string | 'todos';
  maxPrice: number | null;
  modality: Modality | 'todas';
  /** Día de la semana con disponibilidad (0–6) o 'cualquiera'. */
  weekday: number | 'cualquiera';
}

export const specialties = [...new Set(doctors.map((d) => d.specialty))].sort();
export const healthProblems = [...new Set(doctors.flatMap((d) => d.healthProblems))].sort();

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function searchDoctors(filters: DirectoryFilters): Promise<Doctor[]> {
  return simulate(() => {
    const q = normalize(filters.query.trim());
    return doctors.filter((d) => {
      if (q && ![d.name, d.specialty, ...d.healthProblems].some((t) => normalize(t).includes(q))) return false;
      if (filters.specialty !== 'todas' && d.specialty !== filters.specialty) return false;
      if (filters.healthProblem !== 'todos' && !d.healthProblems.includes(filters.healthProblem)) return false;
      if (filters.maxPrice !== null && d.priceMxn > filters.maxPrice) return false;
      if (filters.modality !== 'todas' && !d.modalities.includes(filters.modality)) return false;
      if (filters.weekday !== 'cualquiera' && !doctorSchedules.some((s) => s.doctorId === d.id && s.weekday === filters.weekday)) return false;
      return true;
    });
  });
}

export interface DoctorProfile {
  doctor: Doctor;
  schedules: DoctorSchedule[];
}

export function getDoctorProfile(id: string): Promise<DoctorProfile | null> {
  return simulate(() => {
    const doctor = doctorById(id);
    if (!doctor) return null;
    return { doctor, schedules: doctorSchedules.filter((s) => s.doctorId === id) };
  });
}

export function getAllDoctors(): Promise<Doctor[]> {
  return simulate(() => doctors);
}
