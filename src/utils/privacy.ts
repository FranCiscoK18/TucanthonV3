/**
 * Detección básica de datos personales en texto libre. No es infalible: sirve para
 * avisar a la persona antes de enviar y para evitar que la DEMO almacene ese tipo de datos.
 */
export interface PersonalDataIssue {
  kind: 'correo' | 'telefono' | 'direccion' | 'identificador';
  message: string;
}

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;
const PHONE = /(?:\+?\d[\s.-]?){7,}/;
const ADDRESS = /\b(?:calle|c\.|avenida|av\.?|andador|retorno|mz\.?|manzana|lote|lt\.?|n[uú]m(?:ero)?\.?|no\.)\s*#?\s*\d+|#\s*\d+/i;
const CURP = /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/i;

export function detectPersonalData(text: string): PersonalDataIssue[] {
  const issues: PersonalDataIssue[] = [];
  if (EMAIL.test(text)) {
    issues.push({ kind: 'correo', message: 'Parece incluir un correo electrónico. Elimínalo antes de enviar.' });
  }
  if (PHONE.test(text)) {
    issues.push({ kind: 'telefono', message: 'Parece incluir un número de teléfono. Elimínalo antes de enviar.' });
  }
  if (ADDRESS.test(text)) {
    issues.push({
      kind: 'direccion',
      message: 'Parece incluir una dirección (calle, número, manzana o lote). Describe solo la zona en general.',
    });
  }
  if (CURP.test(text)) {
    issues.push({ kind: 'identificador', message: 'Parece incluir un identificador personal (CURP). Elimínalo.' });
  }
  return issues;
}
