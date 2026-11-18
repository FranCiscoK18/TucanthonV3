/**
 * Sesión mock en `localStorage`. NO es autenticación: cualquier persona puede
 * elegir cualquier rol y las rutas protegidas solo se ocultan en el frontend.
 */
import { STORAGE_KEYS } from '../config/demo';
import { roleAliases } from '../config/roles';
import type { MockSession, SessionRole } from '../types';
import { appendAudit } from './auditService';
import { simulateRequest } from './client';
import { isMockSession } from './guards';
import { readStored, removeStored, writeStored } from './storage';

export function readSession(): MockSession | null {
  return readStored(STORAGE_KEYS.session, isMockSession);
}

/** Solo el administrador inicia sesión DEMO; la actividad ciudadana no se registra. */
function logSessionEvent(session: MockSession, kind: 'inicio-sesion' | 'cierre-sesion'): void {
  appendAudit({
    actorRole: session.role,
    actorLabel: session.alias,
    actionCode: kind,
    action: kind === 'inicio-sesion' ? 'Inicio de sesión' : 'Cierre de sesión',
    entityType: 'sesion',
    entityId: session.role,
    detail: 'Acceso institucional registrado localmente en este navegador.',
  });
}

export async function signIn(role: SessionRole): Promise<MockSession> {
  return simulateRequest(
    () => {
      const session: MockSession = {
        role,
        alias: roleAliases[role],
        startedAt: new Date().toISOString(),
        isDemo: true,
      };
      writeStored(STORAGE_KEYS.session, session);
      logSessionEvent(session, 'inicio-sesion');
      return session;
    },
    { failable: false },
  );
}

export async function signOut(): Promise<void> {
  return simulateRequest(
    () => {
      const current = readSession();
      if (current) logSessionEvent(current, 'cierre-sesion');
      removeStored(STORAGE_KEYS.session);
    },
    { failable: false },
  );
}
