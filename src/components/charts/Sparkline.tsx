/** Minigráfica: línea en tono atenuado y el último punto en el color de acento. */
export function Sparkline({
  values,
  label,
  width = 104,
  height = 32,
  accent = '#0f3e17',
}: {
  values: number[];
  label: string;
  width?: number;
  height?: number;
  accent?: string;
}) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const pad = 5;
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const x = (index: number) => pad + index * step;
  const y = (value: number) => height - pad - (value / max) * (height - pad * 2);
  const path = values.map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(' ');
  const lastIndex = values.length - 1;
  return (
    <svg width={width} height={height} role="img" aria-label={label} className="block shrink-0">
      <path d={path} fill="none" stroke="#9aa69c" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(lastIndex)} cy={y(values[lastIndex] ?? 0)} r={4} fill={accent} stroke="#fffefc" strokeWidth={2} />
    </svg>
  );
}
