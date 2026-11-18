import type { UserRole } from '../types';

/**
 * Matriz de acceso por rol (frontend DEMO, sin seguridad real).
 * - `publico`: cualquier persona, con o sin sesión.
 */
export type Access = 'publico' | UserRole[];

export const ROUTE_ACCESS = {
  misReportes: ['ciudadano', 'admin'],
  institucion: ['institucion', 'admin'],
  admin: ['admin'],
} as const satisfies Record<string, UserRole[]>;

export const roleLabels: Record<UserRole, string> = {
  invitado: 'Invitado (sin sesión)',
  ciudadano: 'Ciudadano/a',
  institucion: 'Institución',
  admin: 'Administración',
};

export const roleDescriptions: Record<UserRole, string> = {
  invitado: 'Inicio, cómo funciona, mapa, enfermedades, brigadas y normativa. Puede enviar reportes.',
  ciudadano: 'Todo lo público, más seguimiento de reportes propios.',
  institucion: 'Panel institucional con datos agregados.',
  admin: 'Todo, incluida administración, moderación y bitácora.',
};

export function canAccess(role: UserRole, access: Access): boolean {
  return access === 'publico' || access.includes(role);
}
