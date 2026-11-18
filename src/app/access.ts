/**
 * Matriz de acceso por rol (punto 5). Es una restricción de interfaz para la DEMO,
 * NO una medida de seguridad: no hay backend que la haga cumplir.
 */
import type { UserRole } from '../types';

export type AreaId =
  | 'inicio'
  | 'como-funciona'
  | 'mapa'
  | 'enfermedades'
  | 'brigadas'
  | 'directorio'
  | 'reportar'
  | 'normativa'
  | 'mis-reportes'
  | 'citas'
  | 'medico'
  | 'institucion'
  | 'administracion';

const EVERYONE: readonly UserRole[] = ['invitado', 'ciudadano', 'medico', 'institucion', 'admin'];

export const AREA_ROLES: Record<AreaId, readonly UserRole[]> = {
  inicio: EVERYONE,
  'como-funciona': EVERYONE,
  mapa: EVERYONE,
  enfermedades: EVERYONE,
  brigadas: EVERYONE,
  directorio: EVERYONE,
  reportar: EVERYONE,
  normativa: EVERYONE,
  'mis-reportes': ['ciudadano', 'admin'],
  citas: ['ciudadano', 'admin'],
  medico: ['medico', 'admin'],
  institucion: ['institucion', 'admin'],
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
