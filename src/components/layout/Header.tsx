import { Building2, CircleUserRound, LogIn, LogOut, Settings2, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSession } from '../../app/session';
import { roleLabels } from '../../config/roles';
import type { UserRole } from '../../types';
import { DemoTag } from '../ui/Badges';
import { ButtonLink } from '../ui/Button';

const roleIcons: Record<UserRole, LucideIcon> = {
  invitado: CircleUserRound,
  ciudadano: CircleUserRound,
  institucion: Building2,
  admin: Settings2,
};

export function Header() {
  const { session, role, signOut } = useSession();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const RoleIcon = roleIcons[role];

  const handleSignOut = async () => {
    setLeaving(true);
    await signOut();
    setLeaving(false);
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border-mist bg-cream-paper">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="inline-flex shrink-0 items-center rounded-[8px]" aria-label="Ondara, ir al inicio">
            <img src="/brand/ondara-logo.png" alt="" width={720} height={189} className="h-8 w-auto sm:h-9" />
          </Link>
          <span className="hidden text-sm text-muted sm:inline">Cancún</span>
          <DemoTag />
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                to="/acceso"
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-keylime-wash px-3 text-sm font-medium text-forest-ink hover:bg-mint-veil"
                title={`Sesión DEMO: ${session.alias}. Cambiar de rol`}
              >
                <RoleIcon className="size-4" aria-hidden="true" />
                <span className="sr-only">Rol actual: </span>
                <span className="max-w-[7.5rem] truncate sm:max-w-none">{roleLabels[role]}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={leaving}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-[10px] px-2.5 text-sm font-medium text-forest-ink hover:bg-keylime-wash disabled:opacity-60"
              >
                <LogOut className="size-4" aria-hidden="true" />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <ButtonLink to="/acceso" variant="secondary" size="sm" icon={LogIn}>
              <span className="sm:hidden">Entrar</span>
              <span className="hidden sm:inline">Entrar (DEMO)</span>
            </ButtonLink>
          )}
        </div>
      </div>
    </header>
  );
}
