/** Formatos numéricos en español de México. */
const integer = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export function formatInteger(value: number): string {
  return integer.format(value);
}

export function formatDecimal(value: number): string {
  return oneDecimal.format(value);
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toLocaleString('es-MX', { minimumFractionDigits: digits, maximumFractionDigits: digits })} %`;
}

export function formatMXN(value: number): string {
  return `${currency.format(value)} MXN`;
}

export function formatRatio(value: number | null): string {
  return value === null ? 'sin línea base' : `${oneDecimal.format(value)}×`;
}

export function formatSignedPercentChange(current: number, previous: number): string {
  if (previous === 0) return current === 0 ? 'sin cambio' : 'sin referencia previa';
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change);
  if (rounded === 0) return 'sin cambio relevante';
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)} %`;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${formatInteger(count)} ${count === 1 ? singular : plural}`;
}
