import { brigades, campaigns } from '../mocks/brigades';
import type { Campaign, ScheduleBlock, TargetPopulation, VaccinationBrigade } from '../types';
import { simulate } from './client';

export interface BrigadeFilters {
  diseaseId: string | 'todas';
  /** Fecha mínima YYYY-MM-DD o '' */
  from: string;
  schedule: ScheduleBlock | 'todos';
  population: TargetPopulation | 'todas';
  includeFinished: boolean;
}

export function getBrigades(filters: BrigadeFilters): Promise<VaccinationBrigade[]> {
  return simulate(() =>
    brigades
      .filter((b) => filters.diseaseId === 'todas' || b.diseaseIds.includes(filters.diseaseId))
      .filter((b) => !filters.from || b.date >= filters.from)
      .filter((b) => filters.schedule === 'todos' || b.schedule === filters.schedule)
      .filter((b) => filters.population === 'todas' || b.targetPopulation.includes(filters.population))
      .filter((b) => filters.includeFinished || b.status !== 'finalizada')
      .sort((a, b) => a.date.localeCompare(b.date)),
  );
}

export function getBrigade(id: string): Promise<VaccinationBrigade | null> {
  return simulate(() => brigades.find((b) => b.id === id) ?? null);
}

export function getCampaigns(): Promise<Campaign[]> {
  return simulate(() => campaigns);
}
