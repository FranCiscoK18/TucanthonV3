import { Building2, LogOut, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSession } from '../../app/session';
import { ButtonLink } from '../ui/Button';

export function Header() {
  const { session, signOut } = useSession();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const handleSignOut = async () => {
    setLeaving(true);
    try { await signOut(); navigate('/', {replace:true}); }
    finally { setLeaving(false); }
  };
  return (
    <header className="sticky top-0 z-40 border-b border-border-mist bg-cream-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="inline-flex shrink-0 items-center rounded-[8px]" aria-label="Ondara, ir a la portada">
            <img src="/brand/ondara-logo.png" alt="" width={720} height={189} className="h-8 w-auto sm:h-9" />
          </Link>
          <span className="hidden text-sm text-muted sm:inline">Cancún</span>
        </div>
        <nav aria-label="Accesos superiores" className="hidden items-center gap-5 text-sm font-medium text-forest-ink lg:flex">
          <Link to="/inicio" className="hover:underline">Explorar</Link>
          <Link to="/mapa" className="hover:underline">Mapa</Link>
          <Link to="/enfermedades" className="hover:underline">Enfermedades</Link>
        </nav>
        <div className="flex items-center gap-2">
          {session?.role === 'admin' ? (
            <>
              <Link to="/institucion" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-keylime-wash px-3 text-sm font-medium text-forest-ink hover:bg-mint-veil">
                <Building2 className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Centro de vigilancia</span><span className="sm:hidden">Panel</span>
              </Link>
              <button type="button" onClick={handleSignOut} disabled={leaving}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-[10px] px-2.5 text-sm font-medium text-forest-ink hover:bg-keylime-wash disabled:opacity-60">
                <LogOut className="size-4" aria-hidden="true" /> Salir
              </button>
            </>
          ) : (
            <ButtonLink to="/acceso" variant="secondary" size="sm" icon={LockKeyhole}>
              <span className="hidden sm:inline">Acceso administrativo</span>
              <span className="sm:hidden">Admin</span>
            </ButtonLink>
          )}
        </div>
      </div>
    </header>
  );
}
