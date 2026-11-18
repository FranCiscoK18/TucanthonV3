import { STORAGE_KEYS } from '../config/demo';
import type { MockSession, UserRole } from '../types';
import { readJson, removeKey, writeJson } from './storage';

const aliases: Record<Exclude<UserRole, 'invitado'>, string> = {
  ciudadano: 'Ciudadano/a DEMO',
  institucion: 'Analista institucional DEMO',
  admin: 'Administración DEMO',
};

/** Lee la sesión mock de forma síncrona (para el arranque de la app). */
export function readSession(): MockSession | null {
  const session = readJson<MockSession | null>(STORAGE_KEYS.session, null);
  if (!session || !session.role || !(session.role in aliases)) return null;
  return session;
}

/** "Inicia sesión" con un rol. No hay contraseña ni seguridad real. */
export function startSession(role: Exclude<UserRole, 'invitado'>): MockSession {
  const session: MockSession = {
    role,
    alias: aliases[role],
    startedAt: new Date().toISOString(),
    isDemo: true,
  };
  writeJson(STORAGE_KEYS.session, session);
  return session;
}

export function endSession(): void {
  removeKey(STORAGE_KEYS.session);
}
