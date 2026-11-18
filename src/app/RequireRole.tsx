import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../types';
import { useSession } from './SessionContext';

/**
 * Guarda de ruta DEMO. Sin sesión → redirige a /acceso conservando el
 * destino. Con sesión sin permiso → /sin-permiso. Se puede eludir desde las
 * herramientas del navegador: no es seguridad real.
 */
export function RequireRole({ roles, children }: { roles: readonly UserRole[]; children: ReactNode }) {
  const { role } = useSession();
  const location = useLocation();
  if (roles.includes(role)) return <>{children}</>;
  if (role === 'invitado') {
    return <Navigate to="/acceso" replace state={{ from: location.pathname + location.search, needed: roles }} />;
  }
  return <Navigate to="/sin-permiso" replace state={{ from: location.pathname, needed: roles }} />;
}
