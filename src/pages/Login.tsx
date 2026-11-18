import { ArrowRight, Building2, LogOut, Settings2, Stethoscope, UserRound, type LucideIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { roleDescriptions, roleLabels } from '../app/access';
import { useSession } from '../app/SessionContext';
import { Notice } from '../components/ui/Feedback';
import { PageHeader } from '../components/ui/Layout';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { UserRole } from '../types';

const ROLE_ICONS: Record<Exclude<UserRole, 'invitado'>, LucideIcon> = {
  ciudadano: UserRound,
  medico: Stethoscope,
  institucion: Building2,
  admin: Settings2,
};

const DEFAULT_LANDING: Record<Exclude<UserRole, 'invitado'>, string> = {
  ciudadano: '/citas',
  medico: '/medico',
  institucion: '/institucion',
  admin: '/administracion',
};

interface LocationState {
  from?: string;
  needed?: readonly UserRole[];
}

export default function Login() {
  useDocumentTitle('Elegir rol DEMO');
  const { role, login, logout } = useSession();
  const navigate = useNavigate();
  const state = (useLocation().state ?? {}) as LocationState;

  const choose = (r: Exclude<UserRole, 'invitado'>) => {
    login(r);
    const allowed = !state.needed || state.needed.includes(r);
    navigate(state.from && allowed ? state.from : DEFAULT_LANDING[r], { replace: true });
  };

  return (
    <>
      <PageHeader
        eyebrow="Acceso simulado"
        title="Elige un rol DEMO"
        description="Selecciona un rol para explorar la plataforma. No hay contraseñas ni cuentas reales."
      />
      <Notice tone="caution" title="Esto no es autenticación real">
        La sesión se guarda en este navegador (localStorage) y las restricciones de rol son solo de interfaz. No uses este mecanismo para
        proteger datos reales.
      </Notice>
      {state.from && (
        <Notice tone="info" className="mt-3" title="Se necesita una sesión para continuar">
          La sección que intentaste abrir requiere el rol: {(state.needed ?? []).map((r) => roleLabels[r]).join(' o ')}.
        </Notice>
      )}

      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {(Object.keys(ROLE_ICONS) as Array<Exclude<UserRole, 'invitado'>>).map((r) => {
          const Icon = ROLE_ICONS[r];
          const highlighted = state.needed?.includes(r);
          return (
            <li key={r}>
              <button
                type="button"
                onClick={() => choose(r)}
                className={`group flex h-full w-full items-start gap-4 rounded-[14px] p-5 text-left transition-colors md:p-6 ${
                  highlighted ? 'bg-sage hover:bg-mint' : 'bg-keylime hover:bg-mint'
                }`}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cream text-forest">
                  <Icon aria-hidden className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-[19px] font-semibold text-forest">
                    {roleLabels[r]}
                    {role === r && <span className="pill bg-cream text-forest">Sesión actual</span>}
                  </span>
                  <span className="mt-1 block text-[14.5px] text-ink">{roleDescriptions[r]}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-forest">
                    Entrar como {roleLabels[r].toLowerCase()}
                    <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-forest">{roleLabels.invitado}</p>
          <p className="text-[14.5px] text-muted">{roleDescriptions.invitado}</p>
        </div>
        {role === 'invitado' ? (
          <Link to="/" className="btn btn-ghost">
            Seguir sin sesión
          </Link>
        ) : (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <LogOut aria-hidden className="h-4 w-4" />
            Cerrar sesión y seguir como invitado
          </button>
        )}
      </div>
    </>
  );
}
