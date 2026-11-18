const numberFormatter = new Intl.NumberFormat('es-MX');
const decimalFormatter = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const currencyFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export const formatNumber = (n: number): string => numberFormatter.format(n);
export const formatDecimal = (n: number): string => decimalFormatter.format(n);
export const formatCurrency = (n: number): string => currencyFormatter.format(n);
export const formatPercent = (n: number): string => `${decimalFormatter.format(n)} %`;

/** Pluraliza una palabra simple en español. */
export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatNumber(n)} ${n === 1 ? singular : pluralForm}`;
}

/** Genera un folio DEMO legible, p. ej. `REP-DEMO-4F7K2`. */
export function makeFolio(prefix: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-DEMO-${code}`;
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
