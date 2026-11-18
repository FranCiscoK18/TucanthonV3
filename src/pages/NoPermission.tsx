import { Lock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { roleLabels } from '../app/access';
import { useSession } from '../app/SessionContext';
import { EmptyState } from '../components/ui/Feedback';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { UserRole } from '../types';

export default function NoPermission() {
  useDocumentTitle('Sin permiso');
  const { role } = useSession();
  const state = (useLocation().state ?? {}) as { from?: string; needed?: readonly UserRole[] };
  return (
    <EmptyState
      icon={Lock}
      title="Sin permiso para esta sección"
      description={`Tu rol actual (${roleLabels[role]}) no tiene acceso${state.from ? ` a ${state.from}` : ''}.${
        state.needed ? ` Se requiere: ${state.needed.map((r) => roleLabels[r]).join(' o ')}.` : ''
      }`}
      action={
        <>
          <Link to="/" className="btn btn-secondary">
            Ir al inicio
          </Link>
          <Link to="/acceso" state={state} className="btn btn-primary">
            Cambiar de rol DEMO
          </Link>
        </>
      }
    />
  );
}
