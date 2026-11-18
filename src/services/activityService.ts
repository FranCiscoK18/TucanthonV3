/** Brigadas de vacunación y campañas preventivas (DEMO). */
import { getActivitiesMock } from '../mocks/activities';
import { getDemoClock } from '../mocks/clock';
import type { HealthActivity, RegionId, TargetPopulation } from '../types';
import { addDays } from '../utils/dates';
import { NotFoundError, simulateRequest } from './client';

export type DateRangeFilter = 'proximos-7' | 'proximos-14' | 'incluir-pasadas';
export type ScheduleFilter = 'todos' | 'manana' | 'tarde';

export interface ActivityFilters {
  diseaseId: string | 'todas';
  dateRange: DateRangeFilter;
  schedule: ScheduleFilter;
  target: TargetPopulation | 'todas';
  type: HealthActivity['type'] | 'todas';
  regionId: RegionId | 'todas';
}

export const defaultActivityFilters: ActivityFilters = {
  diseaseId: 'todas',
  dateRange: 'proximos-14',
  schedule: 'todos',
  target: 'todas',
  type: 'todas',
  regionId: 'todas',
};

function matchesSchedule(activity: HealthActivity, schedule: ScheduleFilter): boolean {
  if (schedule === 'todos') return true;
  const startsBeforeNoon = activity.startTime < '12:00';
  return schedule === 'manana' ? startsBeforeNoon : !startsBeforeNoon;
}

export function filterActivities(activities: readonly HealthActivity[], filters: ActivityFilters): HealthActivity[] {
  const { today } = getDemoClock();
  const horizon = addDays(today, filters.dateRange === 'proximos-7' ? 7 : 14);
  return activities
    .filter((activity) =>
      filters.dateRange === 'incluir-pasadas' ? true : activity.date >= today && activity.date <= horizon,
    )
    .filter((activity) => filters.diseaseId === 'todas' || activity.diseaseIds.includes(filters.diseaseId))
    .filter((activity) => matchesSchedule(activity, filters.schedule))
    .filter((activity) => filters.target === 'todas' || activity.targetPopulations.includes(filters.target))
    .filter((activity) => filters.type === 'todas' || activity.type === filters.type)
    .filter((activity) => filters.regionId === 'todas' || activity.regionId === filters.regionId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
}

export async function getActivities(filters: ActivityFilters): Promise<HealthActivity[]> {
  return simulateRequest(() => filterActivities(getActivitiesMock(), filters));
}

export async function getActivity(id: string): Promise<HealthActivity> {
  return simulateRequest(() => {
    const activity = getActivitiesMock().find((item) => item.id === id);
    if (!activity) throw new NotFoundError('No encontramos esa brigada o campaña en la agenda de referencia.');
    return activity;
  });
}
