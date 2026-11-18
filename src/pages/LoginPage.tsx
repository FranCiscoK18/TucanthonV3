import { Building2, CircleUserRound, Settings2, ShieldAlert, Stethoscope, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AREA_ROLES, type AreaId } from '../app/access';
import { NAV_ITEMS } from '../app/navigation';
import { useSession } from '../app/session';
import { Button, ButtonLink } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';
import { PageHeader } from '../components/ui/PageHeader';
import { roleAccessSummary, roleAliases, roleLabels, sessionRoles } from '../config/roles';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { SessionRole } from '../types';
import { cx } from '../utils/cx';

const roleIcons: Record<SessionRole, LucideIcon> = {
  ciudadano: CircleUserRound,
  medico: Stethoscope,
  institucion: Building2,
  admin: Settings2,
};

function isArea(value: string | null): value is AreaId {
  return value !== null && value in AREA_ROLES;
}

/** Solo se permite volver a rutas internas (evita redirecciones abiertas). */
function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

export function LoginPage() {
  useDocumentTitle('Acceso DEMO');
  const { role: currentRole, signIn } = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [pending, setPending] = useState<SessionRole | null>(null);
  const next = safeNext(params.get('siguiente'));
  const areaParam = params.get('area');
  const area = isArea(areaParam) ? areaParam : null;
  const areaLabel = area ? NAV_ITEMS.find((item) => item.area === area)?.label : null;
  const allowedRoles = area ? AREA_ROLES[area] : null;

  const choose = async (role: SessionRole) => {
    setPending(role);
    await signIn(role);
    setPending(null);
    const canGoNext = next && (!allowedRoles || allowedRoles.includes(role));
    navigate(canGoNext ? next : role === 'ciudadano' ? '/' : (NAV_ITEMS.find((item) => AREA_ROLES[item.area].includes(role) && item.group === 'gestion')?.to ?? '/'), {
      replace: true,
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Sesión simulada"
        title="Elige un rol para la demostración"
        description="No hay contraseñas ni cuentas reales. Elegir un rol solo cambia lo que ves en esta DEMO. Las funciones públicas no requieren cuenta."
      />

      {areaLabel && (
        <Notice tone="info" title={`«${areaLabel}» requiere una sesión DEMO`} className="mb-6" role="status">
          Elige un rol con acceso a esa sección para continuar. Roles con acceso:{' '}
          {allowedRoles
            ?.filter((role) => role !== 'invitado')
            .map((role) => roleLabels[role])
            .join(', ')}
          .
        </Notice>
      )}

      <Notice tone="caution" title="No es autenticación real" icon={ShieldAlert} className="mb-8">
        Las restricciones por rol solo existen en la interfaz y pueden eludirse desde el navegador. Nunca uses este
        mecanismo con datos reales.
      </Notice>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sessionRoles.map((role) => {
          const Icon = roleIcons[role];
          const allowed = !allowedRoles || allowedRoles.includes(role);
          const isCurrent = currentRole === role;
          return (
            <li key={role} className={cx('card flex flex-col', isCurrent ? 'card-sage' : 'card-keylime')}>
              <div className="flex items-start gap-3">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-cream-paper text-forest-ink">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[1.5rem]">{roleLabels[role]}</h2>
                  <p className="text-sm text-muted">Alias en pantalla: {roleAliases[role]}</p>
                </div>
              </div>
              <p className="mt-4 flex-1 leading-relaxed">{roleAccessSummary[role]}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => choose(role)}
                  loading={pending === role}
                  disabled={pending !== null && pending !== role}
                  variant={allowed ? 'primary' : 'secondary'}
                  aria-describedby={!allowed ? `sin-acceso-${role}` : undefined}
                >
                  {isCurrent ? 'Continuar con este rol' : `Entrar como ${roleLabels[role].toLowerCase()}`}
                </Button>
                {!allowed && (
                  <span id={`sin-acceso-${role}`} className="text-sm text-muted">
                    Sin acceso a «{areaLabel}»
                  </span>
                )}
                {isCurrent && <span className="text-sm font-medium text-forest-ink">Rol actual</span>}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <ButtonLink to="/" variant="ghost">
          Seguir sin cuenta (invitado)
        </ButtonLink>
        <p className="text-sm text-muted">{roleAccessSummary.invitado}</p>
      </div>
    </>
  );
}
