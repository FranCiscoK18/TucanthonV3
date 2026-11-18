import { LogIn, LogOut, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { roleLabels } from '../../app/access';
import { useSession } from '../../app/SessionContext';
import { DemoBadge } from '../ui/Badges';

export function Header() {
  const { session, role, logout } = useSession();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/85">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 md:px-7">
        <Link to="/" className="flex min-w-0 items-center gap-3 rounded-[7px]" aria-label="Ondara Cancún, ir al inicio">
          <img src="/ondara-logo.jpg" alt="" width={1600} height={533} className="h-9 w-auto mix-blend-multiply md:h-10" />
          <span className="hidden text-[13px] leading-tight text-muted sm:block">
            Cancún
            <br />
            Inteligencia epidemiológica participativa
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3">
          <DemoBadge className="hidden md:inline-flex" />
          {session ? (
            <>
              <span className="hidden items-center gap-2 rounded-full bg-keylime px-3 py-1.5 text-[13px] text-forest md:inline-flex">
                <UserRound aria-hidden className="h-4 w-4" />
                <span>
                  <span className="sr-only">Sesión DEMO como </span>
                  {roleLabels[role]}
                </span>
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <LogOut aria-hidden className="h-4 w-4" />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <Link to="/acceso" className="btn btn-primary btn-sm">
              <LogIn aria-hidden className="h-4 w-4" />
              Entrar (DEMO)
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
