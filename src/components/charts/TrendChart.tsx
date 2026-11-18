import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDecimal, formatNumber } from '../../utils/format';
import { weekLabel } from '../../utils/dates';

export interface TrendPoint {
  week: string;
  value: number;
  baseline?: number;
}

interface TooltipPayload {
  payload: TrendPoint;
}

function ChartTooltip({ active, payload, unit }: { active?: boolean; payload?: TooltipPayload[]; unit: string }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="rounded-[10px] border border-hairline bg-cream px-3 py-2 text-[13px] text-ink">
      <p className="font-semibold">Semana {weekLabel(point.week)}</p>
      <p>
        {formatNumber(point.value)} {unit}
      </p>
      {point.baseline !== undefined && <p className="text-muted">Línea base semanal: {formatDecimal(point.baseline)}</p>}
    </div>
  );
}

/**
 * Tendencia semanal con línea base y ventana de señal sombreada.
 * Una sola serie: el título de la tarjeta la nombra (sin leyenda).
 */
export function TrendChart({
  data,
  unit,
  windowWeeks,
  color = '#0f3e17',
  ariaLabel,
}: {
  data: TrendPoint[];
  unit: string;
  windowWeeks?: number;
  color?: string;
  ariaLabel: string;
}) {
  const windowStart = windowWeeks ? data[data.length - windowWeeks]?.week : undefined;
  const windowEnd = data[data.length - 1]?.week;
  return (
    <div role="img" aria-label={ariaLabel} className="h-[260px] w-full md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" />
          {windowStart && windowEnd && (
            <ReferenceArea x1={windowStart} x2={windowEnd} fill="#e1f4df" fillOpacity={0.9} ifOverflow="extendDomain" />
          )}
          <XAxis dataKey="week" tickFormatter={weekLabel} tick={{ fontSize: 12, fill: '#4d5a50' }} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4d5a50' }} axisLine={false} tickLine={false} width={44} />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: '#9a9a92', strokeWidth: 1 }} />
          <Area type="monotone" dataKey="value" stroke="none" fill={color} fillOpacity={0.08} isAnimationActive={false} />
          <Line
            type="monotone"
            dataKey="baseline"
            stroke="#6b6b64"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color, stroke: '#fffefc', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: color, stroke: '#fffefc', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
