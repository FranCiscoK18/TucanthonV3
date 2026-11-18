import { SIGNAL_CRITERIA } from '../config/demo';
import { TEXTS } from '../config/texts';
import { formatDecimal } from '../utils/format';
import { Notice } from './ui/Notice';

/** Criterios transparentes de la regla de señal, visibles siempre junto a las señales. */
export function SignalCriteria({ className }: { className?: string }) {
  const { windowWeeks, baselineWeeks, thresholdRatio, minObservations } = SIGNAL_CRITERIA;
  const items = [
    { term: 'Ventana de tiempo', value: `Las ${windowWeeks} semanas epidemiológicas más recientes.` },
    { term: 'Línea base', value: `Promedio semanal de las ${baselineWeeks} semanas anteriores a la ventana.` },
    {
      term: 'Umbral',
      value: `La ventana suma al menos ${formatDecimal(thresholdRatio)} veces lo esperado por la línea base para el mismo número de semanas.`,
    },
    {
      term: 'Mínimo de observaciones',
      value: `${minObservations} registros en la ventana. Con menos, la regla no se evalúa («datos insuficientes»).`,
    },
  ];
  return (
    <div className={className}>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.term} className="rounded-[12px] bg-cream-paper p-4">
            <dt className="text-sm font-semibold text-forest-ink">{item.term}</dt>
            <dd className="mt-1 leading-relaxed">{item.value}</dd>
          </div>
        ))}
      </dl>
      <Notice tone="integrity" className="mt-3">
        {TEXTS.signalDisclaimer}
      </Notice>
    </div>
  );
}
