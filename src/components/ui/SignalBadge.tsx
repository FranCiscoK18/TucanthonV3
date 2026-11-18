import { CircleHelp, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { SignalStatus } from '../../types';
import { formatRatio, formatSignedPercentChange } from '../../utils/format';
import { Pill } from './Badges';

/** Estado de la regla de señal. Tono sereno, con icono y texto (nunca solo color). */
export function SignalBadge({ status, ratio }: { status: SignalStatus; ratio?: number | null }) {
  if (status === 'senal') {
    return (
      <Pill tone="warning" icon={TrendingUp}>
        Señal: incremento inusual{ratio ? ` (${formatRatio(ratio)})` : ''}
      </Pill>
    );
  }
  if (status === 'insuficiente') {
    return (
      <Pill tone="neutral" icon={CircleHelp}>
        Datos insuficientes
      </Pill>
    );
  }
  return (
    <Pill tone="neutral" icon={Minus}>
      Sin señal
    </Pill>
  );
}

/** Cambio entre dos periodos, en texto neutro con icono de dirección. */
export function ChangeText({ current, previous }: { current: number; previous: number }) {
  const Icon = current > previous ? TrendingUp : current < previous ? TrendingDown : Minus;
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm text-muted tabular-nums">
      <Icon className="size-4" aria-hidden="true" />
      {formatSignedPercentChange(current, previous)}
      <span className="sr-only"> respecto a las 4 semanas previas</span>
    </span>
  );
}
