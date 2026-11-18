/**
 * Utilidades de fechas. Las fechas de calendario (`AAAA-MM-DD`) se manejan en UTC
 * para evitar desfases; la hora local de referencia es la de Cancún (UTC−5).
 */
import { CANCUN_UTC_OFFSET_HOURS, TIME_ZONE } from '../config/demo';
import type { EpiWeek, ISODate, ISODateTime } from '../types';

const DAY_MS = 86_400_000;

function partsOf(date: ISODate): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error(`Fecha inválida: ${date}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Milisegundos UTC de la medianoche de una fecha de calendario. */
export function dateToUtcMs(date: ISODate): number {
  const [y, m, d] = partsOf(date);
  return Date.UTC(y, m - 1, d);
}

export function utcMsToDate(ms: number): ISODate {
  return new Date(ms).toISOString().slice(0, 10);
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const ms = dateToUtcMs(value);
  return utcMsToDate(ms) === value;
}

/** Fecha de hoy en Cancún. */
export function todayISO(now: Date = new Date()): ISODate {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function addDays(date: ISODate, days: number): ISODate {
  return utcMsToDate(dateToUtcMs(date) + days * DAY_MS);
}

export function diffDays(later: ISODate, earlier: ISODate): number {
  return Math.round((dateToUtcMs(later) - dateToUtcMs(earlier)) / DAY_MS);
}

/** 0 = domingo … 6 = sábado. */
export function weekdayOf(date: ISODate): number {
  return new Date(dateToUtcMs(date)).getUTCDay();
}

/** Domingo que inicia la semana epidemiológica de una fecha. */
export function startOfEpiWeek(date: ISODate): ISODate {
  return addDays(date, -weekdayOf(date));
}

/**
 * Semana epidemiológica (domingo a sábado). La semana 1 es la primera que tiene
 * al menos cuatro días del año nuevo, es decir, la que contiene el 4 de enero.
 */
export function epiWeekOf(date: ISODate): EpiWeek {
  const start = startOfEpiWeek(date);
  const year = new Date(dateToUtcMs(addDays(start, 3))).getUTCFullYear();
  const week1Start = startOfEpiWeek(`${year}-01-04`);
  const week = Math.floor(diffDays(start, week1Start) / 7) + 1;
  return {
    id: `${year}-SE${String(week).padStart(2, '0')}`,
    year,
    week,
    start,
    end: addDays(start, 6),
    label: `SE ${week}`,
  };
}

/** `count` semanas consecutivas que terminan en la semana de `endDate` (de la más antigua a la más reciente). */
export function epiWeeksEndingAt(endDate: ISODate, count: number): EpiWeek[] {
  const lastStart = startOfEpiWeek(endDate);
  return Array.from({ length: count }, (_, index) => epiWeekOf(addDays(lastStart, -7 * (count - 1 - index))));
}

/** Instante UTC (ISO) que corresponde a una fecha y hora locales de Cancún. */
export function cancunLocalToIso(date: ISODate, time: string): ISODateTime {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  const hours = match ? Number(match[1]) : 0;
  const minutes = match ? Number(match[2]) : 0;
  const ms = dateToUtcMs(date) + (hours - CANCUN_UTC_OFFSET_HOURS) * 3_600_000 + minutes * 60_000;
  return new Date(ms).toISOString();
}

/** Fecha de calendario en Cancún de un instante ISO. */
export function isoToCancunDate(iso: ISODateTime): ISODate {
  return todayISO(new Date(iso));
}

export function hoursBetween(laterIso: ISODateTime, earlierIso: ISODateTime): number {
  return (Date.parse(laterIso) - Date.parse(earlierIso)) / 3_600_000;
}

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

const dateLongFormatter = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIME_ZONE,
});

/** «14 nov 2026». */
export function formatDate(date: ISODate): string {
  return dateFormatter.format(new Date(dateToUtcMs(date))).replace(/\./g, '');
}

/** «sábado, 14 de noviembre». */
export function formatDateLong(date: ISODate): string {
  return dateLongFormatter.format(new Date(dateToUtcMs(date)));
}

/** «14 nov 2026, 10:32» en hora de Cancún. */
export function formatDateTime(iso: ISODateTime): string {
  return dateTimeFormatter.format(new Date(iso)).replace(/\./g, '');
}

/** «SE 42–45 (18 oct – 14 nov 2026)». */
export function formatWeekRange(weeks: readonly EpiWeek[]): string {
  const first = weeks[0];
  const last = weeks[weeks.length - 1];
  if (!first || !last) return '';
  const span = first.id === last.id ? last.label : `SE ${first.week}–${last.week}`;
  return `${span} (${formatDate(first.start)} – ${formatDate(last.end)})`;
}
