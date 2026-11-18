/** Roles mock: etiquetas, alias genéricos y descripción de acceso (tabla del punto 5). */
import type { SessionRole, UserRole } from '../types';

export const roleLabels: Record<UserRole, string> = {
  invitado: 'Invitado',
  ciudadano: 'Ciudadanía',
  medico: 'Médico o médica',
  institucion: 'Institución',
  admin: 'Administración',
};

/** Alias genérico de cada rol: la DEMO nunca pide ni guarda un nombre real. */
export const roleAliases: Record<SessionRole, string> = {
  ciudadano: 'Ciudadanía DEMO',
  medico: 'Dra. Itzel Ejemplo (perfil DEMO)',
  institucion: 'Jurisdicción sanitaria (DEMO)',
  admin: 'Administración Ondara (DEMO)',
};

export const roleAccessSummary: Record<UserRole, string> = {
  invitado: 'Inicio, cómo funciona, mapa, enfermedades, brigadas, directorio y normativa. Puede enviar reportes.',
  ciudadano: 'Todo lo público, más agenda de citas y seguimiento de sus reportes.',
  medico: 'Su perfil y su agenda simulada. No ve reportes individuales.',
  institucion: 'Panel institucional con datos agregados.',
  admin: 'Todo, incluida la administración de fuentes, la moderación y la bitácora.',
};

export const sessionRoles: SessionRole[] = ['ciudadano', 'medico', 'institucion', 'admin'];
