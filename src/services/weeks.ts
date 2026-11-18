import { DEMO_WEEKS } from '../utils/dates';
import { weekStart } from '../mocks/reports';

/**
 * Semana DEMO a la que pertenece una fecha ISO. Las fechas posteriores a la
 * última semana DEMO (p. ej. reportes creados hoy) se asignan a la última
 * semana para que aparezcan en los agregados recientes.
 */
export function weekOf(iso: string): string {
  const t = new Date(iso).getTime();
  for (let i = DEMO_WEEKS.length - 1; i >= 0; i -= 1) {
    const week = DEMO_WEEKS[i]!;
    if (t >= weekStart(week).getTime()) return week;
  }
  return DEMO_WEEKS[0]!;
}
