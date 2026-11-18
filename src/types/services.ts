import type { DemoRecord, ISODate, ISODateTime, LngLat } from './common';
import type { RegionId } from './epidemiology';

export type TargetPopulation =
  | 'ninez'
  | 'adolescentes'
  | 'personas-adultas'
  | 'personas-mayores'
  | 'embarazadas'
  | 'poblacion-general';

export type ActivityStatus = 'programada' | 'en-curso' | 'finalizada' | 'reprogramada';

interface HealthActivityBase extends DemoRecord {
  id: string;
  title: string;
  diseaseIds: string[];
  regionId: RegionId;
  /** Referencia genérica de un espacio público. Nunca un domicilio. */
  venueHint: string;
  /** Punto aproximado dentro de la zona, solo para ubicarla en el mapa. */
  approxPoint: LngLat;
  date: ISODate;
  startTime: string;
  endTime: string;
  targetPopulations: TargetPopulation[];
  requirements: string[];
  status: ActivityStatus;
  organizer: string;
  sourceId: string;
  description: string;
}

export interface VaccinationBrigade extends HealthActivityBase {
  type: 'brigada-vacunacion';
  vaccines: string[];
}

export interface Campaign extends HealthActivityBase {
  type: 'campana-preventiva';
  topic: string;
}

export type HealthActivity = VaccinationBrigade | Campaign;

export type ProviderType = 'medico' | 'consultorio' | 'clinica';
export type CareModality = 'presencial' | 'en-linea';

/** Bloque semanal de atención de un servicio del directorio. */
export interface DoctorSchedule extends DemoRecord {
  doctorId: string;
  /** 0 = domingo … 6 = sábado. */
  weekday: number;
  start: string;
  end: string;
  slotMinutes: number;
  modalities: CareModality[];
}

/** Médico, consultorio o clínica del directorio. Credenciales simuladas. */
export interface Doctor extends DemoRecord {
  id: string;
  providerType: ProviderType;
  name: string;
  specialty: string;
  healthTopics: string[];
  priceMXN: number;
  modalities: CareModality[];
  regionId: RegionId;
  /** Referencia de zona; el directorio no publica direcciones. */
  locationHint: string;
  credential: string;
  languages: string[];
  bio: string;
  schedule: DoctorSchedule[];
}

export type AppointmentStatus = 'confirmada' | 'cancelada';

/** Cita simulada. No contiene nombre, contacto ni motivo de consulta. */
export interface Appointment extends DemoRecord {
  id: string;
  folio: string;
  doctorId: string;
  modality: CareModality;
  date: ISODate;
  time: string;
  status: AppointmentStatus;
  createdAt: ISODateTime;
  /** `propia`: creada en este navegador. `ejemplo`: precargada para la agenda médica. */
  origin: 'propia' | 'ejemplo';
}

/** Horario disponible calculado para un día. */
export interface AvailableSlot {
  time: string;
  modalities: CareModality[];
  available: boolean;
}
