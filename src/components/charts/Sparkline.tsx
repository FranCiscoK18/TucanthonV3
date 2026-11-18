/** Mini tendencia SVG (decorativa con resumen textual accesible). */
export function Sparkline({ values, label, color = '#0f3e17' }: { values: number[]; label: string; color?: string }) {
  const w = 120;
  const h = 32;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 3 - (v / max) * (h - 6)).toFixed(1)}`).join(' ');
  const last = values[values.length - 1] ?? 0;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={label} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(values.length - 1) * step} cy={h - 3 - (last / max) * (h - 6)} r={3.5} fill={color} stroke="#fffefc" strokeWidth={2} />
    </svg>
  );
}
