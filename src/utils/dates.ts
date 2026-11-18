/**
 * Utilidades de fechas para la DEMO.
 * La fecha de corte de los datos simulados es fija para que la demo sea
 * reproducible: no depende del reloj del navegador.
 */

/** Fecha de corte DEMO de los agregados (domingo de cierre de la semana 46). */
export const DEMO_CUTOFF_DATE = '2026-11-15';

/** Semanas epidemiológicas DEMO disponibles (12 semanas, de la 35 a la 46). */
export const DEMO_WEEKS: string[] = Array.from({ length: 12 }, (_, i) => `2026-S${String(35 + i).padStart(2, '0')}`);

/** Devuelve las últimas `n` semanas DEMO. */
export function lastWeeks(n: number): string[] {
  return DEMO_WEEKS.slice(-n);
}

/** Etiqueta corta: `2026-S46` → `S46`. */
export function weekLabel(week: string): string {
  return week.split('-')[1] ?? week;
}

const dateFormatter = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
const dateTimeFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const longDateFormatter = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

/** Interpreta `YYYY-MM-DD` como fecha local (evita desfases por zona horaria). */
export function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function formatDate(value: string): string {
  const date = value.length === 10 ? parseLocalDate(value) : new Date(value);
  return dateFormatter.format(date);
}

export function formatDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatLongDate(value: string): string {
  return longDateFormatter.format(parseLocalDate(value));
}

/** `Date` → `YYYY-MM-DD` en hora local. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = parseLocalDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** Diferencia en horas entre dos marcas ISO. */
export function hoursBetween(from: string, to: string): number {
  return (new Date(to).getTime() - new Date(from).getTime()) / 36e5;
}
