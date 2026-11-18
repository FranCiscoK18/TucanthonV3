/** Roles mock: etiquetas, alias genéricos y descripción de acceso. */
import type { SessionRole, UserRole } from '../types';

export const roleLabels: Record<UserRole, string> = {
  invitado: 'Invitado',
  ciudadano: 'Ciudadanía',
  admin: 'Administrador de salud',
};

/** Alias genérico de cada rol: la DEMO nunca pide ni guarda un nombre real. */
export const roleAliases: Record<SessionRole, string> = {
  ciudadano: 'Ciudadanía DEMO',
  admin: 'Administrador de salud (DEMO)',
};

export const roleAccessSummary: Record<UserRole, string> = {
  invitado: 'Inicio, cómo funciona, mapa, enfermedades y brigadas. Puede enviar reportes.',
  ciudadano: 'Todo lo público, más el seguimiento de sus reportes.',
  admin: 'Centro de vigilancia, decisiones simuladas, revisión de reportes, fuentes y bitácora.'
};

export const sessionRoles: SessionRole[] = ['ciudadano', 'admin'];
