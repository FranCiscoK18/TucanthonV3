/**
 * Contexto de sesión mock. El rol `invitado` corresponde a no tener sesión.
 * Se sincroniza entre pestañas mediante el evento `storage`.
 */
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '../config/demo';
import { readSession, signIn as signInService, signOut as signOutService } from '../services/sessionService';
import type { MockSession, SessionRole, UserRole } from '../types';

interface SessionContextValue {
  session: MockSession | null;
  role: UserRole;
  signIn: (role: SessionRole) => Promise<MockSession>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(() => readSession());

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === STORAGE_KEYS.session) setSession(readSession());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const signIn = useCallback(async (role: SessionRole) => {
    const next = await signInService(role);
    setSession(next);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    await signOutService();
    setSession(null);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ session, role: session?.role ?? 'invitado', signIn, signOut }),
    [session, signIn, signOut],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionContextValue {
  const context = use(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de <SessionProvider>.');
  return context;
}
