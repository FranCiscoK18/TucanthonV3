/**
 * Identificadores y folios simulados. Se usa `crypto.getRandomValues`, disponible
 * también en contextos no seguros (por ejemplo, al abrir la DEMO por IP en la red local).
 */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ'; // sin caracteres ambiguos (0/O, 1/I/L, U)

function randomCode(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
}

/** Código determinista a partir de un número (para mocks reproducibles). */
export function codeFromNumber(value: number, length = 4): string {
  let remaining = Math.abs(Math.floor(value));
  let code = '';
  for (let index = 0; index < length; index += 1) {
    code = (ALPHABET[remaining % ALPHABET.length] ?? 'X') + code;
    remaining = Math.floor(remaining / ALPHABET.length);
  }
  return code;
}

function datePart(date: Date): string {
  const yy = String(date.getUTCFullYear()).slice(2);
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

/** Folio de reporte simulado, p. ej. `OND-261118-4F7K`. */
export function newReportFolio(now: Date = new Date()): string {
  return `OND-${datePart(now)}-${randomCode(4)}`;
}

/** Folio de cita simulado, p. ej. `CITA-261118-9QX2`. */
export function newAppointmentFolio(now: Date = new Date()): string {
  return `CITA-${datePart(now)}-${randomCode(4)}`;
}

export function newId(prefix: string): string {
  return `${prefix}-${randomCode(10).toLowerCase()}`;
}

export function folioForDate(prefix: string, iso: string, value: number): string {
  return `${prefix}-${datePart(new Date(iso))}-${codeFromNumber(value)}`;
}
