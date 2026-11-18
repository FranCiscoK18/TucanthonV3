/**
 * Ruta protegida (solo de interfaz). Sin sesión, redirige a «Acceso administrativo DEMO» con el
 * destino solicitado; con un rol sin permiso, muestra el mensaje «Sin permiso».
 */
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { NoPermissionPage } from '../pages/NoPermissionPage';
import { canAccess, type AreaId } from './access';
import { useSession } from './session';

export function RequireArea({ area, children }: { area: AreaId; children: ReactNode }) {
  const { role } = useSession();
  const location = useLocation();
  if (canAccess(role, area)) return <>{children}</>;
  if (role === 'invitado') {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/acceso?siguiente=${encodeURIComponent(next)}&area=${area}`} replace />;
  }
  return <NoPermissionPage area={area} />;
}
