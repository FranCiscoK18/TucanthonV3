import type { DemoRecord, ISODate, LngLat } from './common';
import type { RegionId } from './epidemiology';

export type CareModality = 'presencial' | 'en-linea';

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

