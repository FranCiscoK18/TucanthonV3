/**
 * Reloj de la DEMO. Las series se anclan a la última semana epidemiológica completa
 * antes de hoy, de modo que la demostración siempre luce vigente sin depender de fechas fijas.
 * Los valores se indexan por posición (semana 1 … 16), así que son los mismos en cualquier fecha.
 */
import { SERIES_WEEKS } from '../config/demo';
import type { EpiWeek, ISODate } from '../types';
import { addDays, epiWeekOf, epiWeeksEndingAt, startOfEpiWeek, todayISO } from '../utils/dates';

export interface DemoClock {
  today: ISODate;
  /** Último día (sábado) de la última semana epidemiológica completa: fecha de corte DEMO. */
  cutoff: ISODate;
  cutoffWeek: EpiWeek;
  /** Semanas de la serie, de la más antigua a la más reciente (la última es la de corte). */
  weeks: EpiWeek[];
  /** Semana en curso (parcial), posterior al corte. */
  currentWeek: EpiWeek;
}

let cached: DemoClock | null = null;

export function getDemoClock(): DemoClock {
  if (cached) return cached;
  const today = todayISO();
  const cutoff = addDays(startOfEpiWeek(today), -1);
  cached = {
    today,
    cutoff,
    cutoffWeek: epiWeekOf(cutoff),
    weeks: epiWeeksEndingAt(cutoff, SERIES_WEEKS),
    currentWeek: epiWeekOf(today),
  };
  return cached;
}
