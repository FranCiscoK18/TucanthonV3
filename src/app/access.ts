/**
 * Matriz de acceso por rol. Es una restricción de interfaz para la DEMO,
 * NO una medida de seguridad: no hay backend que la haga cumplir.
 */
import type { UserRole } from '../types';

export type AreaId =
  | 'inicio'
  | 'mapa'
  | 'enfermedades'
  | 'brigadas'
  | 'reportar'
  | 'mis-reportes'
  | 'institucion'
  | 'administracion';


const EVERYONE: readonly UserRole[] = ['invitado', 'admin'];

export const AREA_ROLES: Record<AreaId, readonly UserRole[]> = {
  inicio: EVERYONE,
  mapa: EVERYONE,
  enfermedades: EVERYONE,
  brigadas: EVERYONE,
  reportar: EVERYONE,
  'mis-reportes': EVERYONE,
  institucion: ['admin'],
  administracion: ['admin'],
};

export function canAccess(role: UserRole, area: AreaId): boolean {
  return AREA_ROLES[area].includes(role);
}

/** Rol sugerido para entrar a un área protegida. */
export function suggestedRoleFor(area: AreaId): Exclude<UserRole, 'invitado'> {
  const allowed = AREA_ROLES[area].filter((role): role is Exclude<UserRole, 'invitado'> => role !== 'invitado');
  return allowed[0] ?? 'admin';
}
