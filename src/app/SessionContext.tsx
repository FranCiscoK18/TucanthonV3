import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { endSession, readSession, startSession } from '../services/sessionService';
import type { MockSession, UserRole } from '../types';

interface SessionContextValue {
  session: MockSession | null;
  role: UserRole;
  login: (role: Exclude<UserRole, 'invitado'>) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/** Sesión mock en localStorage. NO es autenticación real. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(() => readSession());

  const login = useCallback((role: Exclude<UserRole, 'invitado'>) => setSession(startSession(role)), []);
  const logout = useCallback(() => {
    endSession();
    setSession(null);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ session, role: session?.role ?? 'invitado', login, logout }),
    [session, login, logout],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider');
  return ctx;
}
