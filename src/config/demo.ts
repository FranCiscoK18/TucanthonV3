/**
 * Configuración funcional de la DEMO (umbrales, privacidad, almacenamiento).
 * La latencia y la tasa de error de los servicios simulados viven en
 * `src/services/config.ts`, su único punto de configuración.
 */
import type { SignalCriteria } from '../types';

export const APP_NAME = 'Ondara Cancún';

/** Cancún usa UTC−5 todo el año (sin horario de verano desde 2015). */
export const TIME_ZONE = 'America/Cancun';
export const CANCUN_UTC_OFFSET_HOURS = -5;

/** Criterios transparentes de la señal por incremento inusual (visibles en la UI). */
export const SIGNAL_CRITERIA: SignalCriteria = {
  windowWeeks: 2,
  baselineWeeks: 8,
  thresholdRatio: 1.5,
  minObservations: 10,
};

/** Semanas epidemiológicas de historia que genera la DEMO. */
export const SERIES_WEEKS = 16;

/**
 * Supresión de conteos pequeños en vistas públicas: un conteo de reportes
 * menor a este valor se publica como «<3» para no facilitar la identificación.
 */
export const MIN_PUBLIC_COUNT = 3;

/** Umbral DEMO del porcentaje de ovitrampas positivas para marcar una zona. */
export const VECTOR_THRESHOLD_PCT = 45;

/** Datos operativos simulados del piloto. */
export const PILOT = {
  totalDays: 90,
  currentDay: 52,
  /** Costo operativo semanal simulado (moderación, materiales QR, alojamiento). */
  weeklyOperatingCostMXN: 18_500,
} as const;

/** Únicas claves de `localStorage` permitidas por el alcance de la DEMO. */
export const STORAGE_KEYS = {
  session: 'ondara.demo.sesion',
  appointments: 'ondara.demo.citas',
  reports: 'ondara.demo.reportes',
  audit: 'ondara.demo.bitacora',
} as const;

/** Longitud máxima del comentario libre de un reporte. */
export const REPORT_COMMENT_MAX = 280;
