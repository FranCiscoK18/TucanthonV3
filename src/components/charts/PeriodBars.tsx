import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatNumber } from '../../utils/format';

export interface PeriodBarDatum {
  label: string;
  value: number;
}

/** Comparación de dos periodos (una sola medida, barras delgadas con etiqueta directa). */
export function PeriodBars({ data, ariaLabel, color = '#0f3e17' }: { data: PeriodBarDatum[]; ariaLabel: string; color?: string }) {
  return (
    <div role="img" aria-label={ariaLabel} className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#4d5a50' }} axisLine={{ stroke: '#c3c2b7' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#4d5a50' }} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            cursor={{ fill: '#f2f1ec' }}
            formatter={(v: number) => [formatNumber(v), 'Registros DEMO']}
            contentStyle={{ borderRadius: 10, border: '1px solid #e4e2dc', fontSize: 13 }}
          />
          <Bar dataKey="value" fill={color} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false}>
            <LabelList dataKey="value" position="top" style={{ fontSize: 12, fill: '#222' }} formatter={(v: number) => formatNumber(v)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
