/** Construcción y descarga local de archivos CSV (sin peticiones de red). */
export type CsvValue = string | number | boolean;

function escapeCell(value: CsvValue): string {
  const text = typeof value === 'boolean' ? (value ? 'sí' : 'no') : String(value);
  // Evita la inyección de fórmulas al abrir el archivo en hojas de cálculo (solo en textos).
  const safe = typeof value === 'string' && /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(header: readonly string[], rows: ReadonlyArray<readonly CsvValue[]>): string {
  const lines = [header, ...rows].map((row) => row.map(escapeCell).join(','));
  return `﻿${lines.join('\n')}\n`;
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
