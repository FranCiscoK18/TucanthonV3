/** Convierte filas agregadas a CSV (separador coma, comillas dobles escapadas). */
export function toCsv(headers: string[], rows: Array<Array<string | number>>): string {
  const escape = (value: string | number): string => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
}

/** Descarga un archivo de texto en el navegador. No hace peticiones de red. */
export function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8'): void {
  // BOM para que hojas de cálculo reconozcan acentos.
  const blob = new Blob(['﻿', content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
