/**
 * Sesión mock en `localStorage`. NO es autenticación: cualquier persona puede
 * elegir cualquier rol y las rutas protegidas solo se ocultan en el frontend.
 */
import { STORAGE_KEYS } from '../config/demo';
import { roleAliases } from '../config/roles';
import { LINKED_DOCTOR_ID } from '../mocks/doctors';
import type { MockSession, SessionRole } from '../types';
import { appendAudit } from './auditService';
import { simulateRequest } from './client';
import { isMockSession } from './guards';
import { readStored, removeStored, writeStored } from './storage';

export function readSession(): MockSession | null {
  return readStored(STORAGE_KEYS.session, isMockSession);
}

/** Los roles institucionales quedan en bitácora; la actividad ciudadana no se registra. */
function logSessionEvent(session: MockSession, kind: 'inicio-sesion' | 'cierre-sesion'): void {
  if (session.role === 'ciudadano') return;
  appendAudit({
    actorRole: session.role,
    actorLabel: session.alias,
    actionCode: kind,
    action: kind === 'inicio-sesion' ? 'Inicio de sesión DEMO' : 'Cierre de sesión DEMO',
    entityType: 'sesion',
    entityId: session.role,
    detail: 'Selección de rol simulada; no es autenticación real.',
  });
}

export async function signIn(role: SessionRole): Promise<MockSession> {
  return simulateRequest(
    () => {
      const session: MockSession = {
        role,
        alias: roleAliases[role],
        startedAt: new Date().toISOString(),
        ...(role === 'medico' ? { linkedDoctorId: LINKED_DOCTOR_ID } : {}),
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
