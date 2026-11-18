/** Roles mock: etiquetas, alias genéricos y descripción de acceso (tabla del punto 5). */
import type { SessionRole, UserRole } from '../types';

export const roleLabels: Record<UserRole, string> = {
  invitado: 'Invitado',
  admin: 'Administrador de salud',
};

/** Alias genérico de cada rol: la DEMO nunca pide ni guarda un nombre real. */
export const roleAliases: Record<SessionRole, string> = {
  admin: 'Autoridad sanitaria (DEMO)',
};

export const roleAccessSummary: Record<UserRole, string> = {
  invitado: 'Portada, mapa, enfermedades, brigadas, envío y seguimiento local de reportes sin cuenta.',
  admin: 'Centro de vigilancia, decisiones simuladas, revisión de reportes, fuentes y bitácora.'
};

export const sessionRoles: SessionRole[] = ['admin'];
