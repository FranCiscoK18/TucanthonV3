import type { SignalCriteria, SignalResult } from '../types';

/**
 * Criterios transparentes (DEMO) para señales por incremento inusual.
 * Se muestran tal cual en la interfaz.
 */
export const DEFAULT_SIGNAL_CRITERIA: SignalCriteria = {
  windowWeeks: 2,
  baselineWeeks: 8,
  ratioThreshold: 1.5,
  minObservations: 10,
};

export const SIGNAL_DISCLAIMER =
  'Esta señal indica que un dato cambió respecto a su línea base; no es un diagnóstico ni la confirmación de un brote.';

/**
 * Compara la suma de la ventana reciente con el promedio de sumas
 * equivalentes en la línea base.
 *
 * `series` son conteos semanales en orden cronológico.
 */
export function computeSignal(
  series: number[],
  diseaseId: string,
  regionId: string | 'todas',
  criteria: SignalCriteria = DEFAULT_SIGNAL_CRITERIA,
): SignalResult {
  const { windowWeeks, baselineWeeks, ratioThreshold, minObservations } = criteria;
  const window = series.slice(-windowWeeks);
  const baseline = series.slice(-(windowWeeks + baselineWeeks), -windowWeeks);
  const windowTotal = window.reduce((a, b) => a + b, 0);
  const baselineWeekly = baseline.length ? baseline.reduce((a, b) => a + b, 0) / baseline.length : 0;
  const baselineMean = baselineWeekly * windowWeeks;
  const ratio = baselineMean > 0 ? windowTotal / baselineMean : null;
  const meetsMinimum = windowTotal >= minObservations;
  return {
    diseaseId,
    regionId,
    windowTotal,
    baselineMean,
    ratio,
    meetsMinimum,
    triggered: meetsMinimum && ratio !== null && ratio >= ratioThreshold,
    criteria,
  };
}
