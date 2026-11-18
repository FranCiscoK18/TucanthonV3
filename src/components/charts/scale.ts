/** Utilidades de escala para las gráficas SVG. */

/** Máximo «redondo» y marcas del eje Y (0, paso, 2·paso…). */
export function niceTicks(maxValue: number, targetCount = 4): number[] {
  if (maxValue <= 0) return [0, 1];
  const rough = maxValue / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const step = (residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1) * magnitude;
  const top = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= top + step / 2; value += step) ticks.push(Math.round(value * 100) / 100);
  return ticks;
}

export function formatTick(value: number): string {
  if (value >= 10_000) return `${Math.round(value / 1000)} mil`;
  return value.toLocaleString('es-MX', { maximumFractionDigits: 1 });
}
