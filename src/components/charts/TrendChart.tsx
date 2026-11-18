/**
 * Gráfica de tendencia semanal (una sola serie, un solo eje). Opcionalmente marca
 * la línea base, el umbral y la ventana evaluada de la regla de señal.
 * Interacción: cursor en cruz con tooltip; con teclado, flechas izquierda/derecha.
 * La tabla de datos acompaña siempre a la gráfica (el tooltip nunca es la única vía).
 */
import { useId, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useElementWidth } from '../../hooks/useElementWidth';
import type { WeeklyPoint } from '../../types';
import { formatDate } from '../../utils/dates';
import { formatTick, niceTicks } from './scale';

export interface TrendChartProps {
  title: string;
  description: string;
  points: WeeklyPoint[];
  unitLabel: string;
  color?: string;
  height?: number;
  valueFormatter?: (value: number) => string;
  /** Línea base: índices (inclusivos) de las semanas que la forman y su promedio semanal. */
  baseline?: { from: number; to: number; mean: number; label: string };
  /** Umbral horizontal desde el índice `from` hasta el final. */
  threshold?: { value: number; from: number; label: string };
  /** Ventana evaluada (sombreado) desde el índice `from` hasta el final. */
  windowFrom?: number;
}

const SURFACE = '#fffefc';
const GRID = '#e7e6e1';
const AXIS_TEXT = '#46534a';
const BASELINE = '#2a78d6';
const THRESHOLD = '#46534a';

export function TrendChart({
  title,
  description,
  points,
  unitLabel,
  color = '#0f3e17',
  height = 260,
  valueFormatter = (value) => value.toLocaleString('es-MX'),
  baseline,
  threshold,
  windowFrom,
}: TrendChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const id = useId();
  const margin = { top: 18, right: 84, bottom: 34, left: 44 };
  const innerWidth = Math.max(80, width - margin.left - margin.right);
  const innerHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(...points.map((point) => point.value), threshold?.value ?? 0, baseline?.mean ?? 0, 1);
  const ticks = niceTicks(maxValue);
  const top = ticks[ticks.length - 1] ?? maxValue;
  const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;
  const x = (index: number) => margin.left + index * step;
  const y = (value: number) => margin.top + innerHeight - (value / top) * innerHeight;
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(point.value).toFixed(1)}`).join(' ');
  const area = `${path} L${x(points.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(innerWidth / 58))));
  const last = points[points.length - 1];
  const lastIndex = points.length - 1;
  const activePoint = active !== null ? points[active] : undefined;

  const handlePointer = (event: PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const relative = event.clientX - box.left;
    const index = step > 0 ? Math.round(relative / step) : 0;
    setActive(Math.min(points.length - 1, Math.max(0, index)));
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    setActive((current) => {
      const start = current ?? lastIndex;
      if (event.key === 'Home') return 0;
      if (event.key === 'End') return lastIndex;
      return Math.min(lastIndex, Math.max(0, start + (event.key === 'ArrowRight' ? 1 : -1)));
    });
  };

  const tooltipLeft = activePoint && active !== null ? Math.min(Math.max(x(active), 90), width - 90) : 0;

  return (
    <div className="relative">
      <div
        ref={ref}
        className="relative rounded-[12px] outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-forest-ink"
        tabIndex={0}
        role="group"
        aria-label={`${title}. Gráfica interactiva: usa las flechas izquierda y derecha para recorrer las semanas. Los mismos datos están en la tabla.`}
        onKeyDown={handleKey}
        onFocus={() => setActive((current) => current ?? lastIndex)}
        onBlur={() => setActive(null)}
      >
        <svg width={width} height={height} role="img" aria-labelledby={`${id}-t ${id}-d`} className="block">
          <title id={`${id}-t`}>{title}</title>
          <desc id={`${id}-d`}>{description}</desc>

          {windowFrom !== undefined && windowFrom < points.length && (
            <g>
              <rect
                x={x(windowFrom) - step / 2}
                y={margin.top}
                width={x(lastIndex) - x(windowFrom) + step / 2 + 6}
                height={innerHeight}
                fill="#e1f4df"
                opacity={0.75}
              />
              <text x={x(windowFrom) - step / 2 + 4} y={margin.top + 12} fontSize={11} fill={AXIS_TEXT}>
                Ventana
              </text>
            </g>
          )}

          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={margin.left} x2={margin.left + innerWidth} y1={y(tick)} y2={y(tick)} stroke={GRID} strokeWidth={1} />
              <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" fontSize={12} fill={AXIS_TEXT} className="tabular-nums">
                {formatTick(tick)}
              </text>
            </g>
          ))}

          {points.map((point, index) =>
            index % labelEvery === 0 || index === lastIndex ? (
              <text key={point.weekId} x={x(index)} y={height - 10} textAnchor="middle" fontSize={12} fill={AXIS_TEXT}>
                {point.label}
              </text>
            ) : null,
          )}

          {baseline && (
            <g>
              <rect
                x={x(baseline.from)}
                y={y(baseline.mean) - 1}
                width={Math.max(0, x(baseline.to) - x(baseline.from))}
                height={2}
                fill={BASELINE}
              />
              <text
                x={x(baseline.from)}
                y={y(baseline.mean) + 15}
                fontSize={11}
                fill={AXIS_TEXT}
                stroke={SURFACE}
                strokeWidth={3}
                paintOrder="stroke"
              >
                {baseline.label}
              </text>
            </g>
          )}

          {threshold && (
            <g>
              <line
                x1={x(threshold.from) - step / 2}
                x2={margin.left + innerWidth + 6}
                y1={y(threshold.value)}
                y2={y(threshold.value)}
                stroke={THRESHOLD}
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
              <text x={margin.left + innerWidth + 8} y={y(threshold.value) + 4} fontSize={11} fill={AXIS_TEXT}>
                {threshold.label}
              </text>
            </g>
          )}

          <path d={area} fill={color} opacity={0.08} />
          <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {last && (
            <g>
              <circle cx={x(lastIndex)} cy={y(last.value)} r={5} fill={color} stroke={SURFACE} strokeWidth={2} />
              <text x={x(lastIndex) + 9} y={y(last.value) + 4} fontSize={12} fontWeight={600} fill="#222222" className="tabular-nums">
                {valueFormatter(last.value)}
              </text>
            </g>
          )}

          {activePoint && active !== null && (
            <g pointerEvents="none">
              <line x1={x(active)} x2={x(active)} y1={margin.top} y2={margin.top + innerHeight} stroke="#7b877d" strokeWidth={1} />
              <circle cx={x(active)} cy={y(activePoint.value)} r={5} fill={color} stroke={SURFACE} strokeWidth={2} />
            </g>
          )}

          <rect
            x={margin.left - step / 2}
            y={margin.top}
            width={innerWidth + step}
            height={innerHeight}
            fill="transparent"
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
            onPointerLeave={() => setActive(null)}
          />
        </svg>

        {activePoint && (
          <div
            className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-[10px] border border-border-mist bg-cream-paper px-3 py-2 text-sm"
            style={{ left: tooltipLeft }}
            aria-hidden="true"
          >
            <p className="font-semibold text-charcoal tabular-nums">
              {valueFormatter(activePoint.value)} <span className="font-normal text-muted">{unitLabel}</span>
            </p>
            <p className="text-xs text-muted">
              {activePoint.label} · {formatDate(activePoint.start)} – {formatDate(activePoint.end)}
            </p>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {activePoint ? `${activePoint.label}: ${valueFormatter(activePoint.value)} ${unitLabel}` : ''}
      </p>
    </div>
  );
}
