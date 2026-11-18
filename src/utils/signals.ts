/**
 * Cálculo transparente de la «señal por incremento inusual».
 * Compara las semanas más recientes (ventana) contra el promedio de semanas
 * previas (línea base). Es una regla estadística simple, no un diagnóstico.
 */
import type { SignalCriteria, SignalStatus } from '../types';

export interface SignalResult {
  windowTotal: number;
  expected: number;
  baselineWeeklyMean: number;
  ratio: number | null;
  status: SignalStatus;
}

/** `values` va de la semana más antigua a la más reciente. */
export function evaluateSignal(values: readonly number[], criteria: SignalCriteria): SignalResult {
  const { windowWeeks, baselineWeeks, thresholdRatio, minObservations } = criteria;
  const end = values.length;
  const window = values.slice(Math.max(0, end - windowWeeks), end);
  const baseline = values.slice(Math.max(0, end - windowWeeks - baselineWeeks), Math.max(0, end - windowWeeks));
  const windowTotal = window.reduce((sum, value) => sum + value, 0);

  if (window.length < windowWeeks || baseline.length < baselineWeeks) {
    return { windowTotal, expected: 0, baselineWeeklyMean: 0, ratio: null, status: 'insuficiente' };
  }

  const baselineWeeklyMean = baseline.reduce((sum, value) => sum + value, 0) / baselineWeeks;
  const expected = baselineWeeklyMean * windowWeeks;
  const ratio = expected > 0 ? windowTotal / expected : null;

  if (windowTotal < minObservations) {
    return { windowTotal, expected, baselineWeeklyMean, ratio, status: 'insuficiente' };
  }
  const isSignal = ratio === null ? windowTotal > 0 : ratio >= thresholdRatio;
  return { windowTotal, expected, baselineWeeklyMean, ratio, status: isSignal ? 'senal' : 'sin-senal' };
}
