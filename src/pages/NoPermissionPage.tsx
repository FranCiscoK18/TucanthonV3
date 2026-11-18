import { LockKeyhole } from 'lucide-react';
import { AREA_ROLES, type AreaId } from '../app/access';
import { NAV_ITEMS } from '../app/navigation';
import { useSession } from '../app/session';
import { ButtonLink } from '../components/ui/Button';
import { roleLabels } from '../config/roles';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NoPermissionPage({ area }: { area: AreaId }) {
  useDocumentTitle('Sin permiso');
  const { role } = useSession();
  const label = NAV_ITEMS.find((item) => item.area === area)?.label ?? 'esta sección';
  const allowed = AREA_ROLES[area].filter((item) => item !== 'invitado').map((item) => roleLabels[item]);
  return (
    <section className="card card-keylime mx-auto max-w-2xl text-center" aria-labelledby="sin-permiso-titulo">
      <LockKeyhole className="mx-auto size-9 text-forest-ink" aria-hidden="true" />
      <h1 id="sin-permiso-titulo" className="mt-3 text-[2rem]">
        Sin permiso
      </h1>
      <p className="mt-3 leading-relaxed">
        Tu perfil actual (<strong>{roleLabels[role]}</strong>) no tiene acceso a «{label}». Pueden entrar:{' '}
        {allowed.join(', ')}.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink to={`/acceso?area=${area}`}>Ir al acceso administrativo</ButtonLink>
        <ButtonLink to="/" variant="secondary">
          Ir al inicio
        </ButtonLink>
      </div>
    </section>
  );
}
