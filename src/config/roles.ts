/** Roles mock: etiquetas, alias genéricos y descripción de acceso (tabla del punto 5). */
import type { SessionRole, UserRole } from '../types';

export const roleLabels: Record<UserRole, string> = {
  invitado: 'Invitado',
  ciudadano: 'Ciudadanía',
  admin: 'Administrador de salud',
};

/** Alias genérico de cada rol: la DEMO nunca pide ni guarda un nombre real. */
export const roleAliases: Record<SessionRole, string> = {
  ciudadano: 'Ciudadanía DEMO',
  admin: 'Autoridad sanitaria (DEMO)',
};

export const roleAccessSummary: Record<UserRole, string> = {
  invitado: 'Inicio, cómo funciona, mapa, enfermedades, brigadas y normativa. Puede enviar reportes.',
  ciudadano: 'Todo lo público, más el seguimiento de sus reportes.',
  admin: 'Centro de vigilancia, decisiones simuladas, revisión de reportes, fuentes y bitácora.'
};

export const sessionRoles: SessionRole[] = ['ciudadano', 'admin'];
