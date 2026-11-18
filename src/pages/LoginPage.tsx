import { Building2, CircleUserRound, ShieldAlert, HeartHandshake, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AREA_ROLES, type AreaId } from '../app/access';
import { useSession } from '../app/session';
import { Button, ButtonLink } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';
import { PageHeader } from '../components/ui/PageHeader';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { SessionRole } from '../types';

function safeNext(value: string | null): string | null {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null;
}
export function LoginPage() {
  useDocumentTitle('Accesos de Ondara');
  const { role: currentRole, signIn } = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [pending, setPending] = useState<SessionRole | null>(null);
  const next = safeNext(params.get('siguiente'));
  const requested = params.get('area');
  const area: AreaId | null = requested && Object.prototype.hasOwnProperty.call(AREA_ROLES, requested)
    ? requested as AreaId : null;
  const choose = async (role: SessionRole) => {
    setPending(role);
    try {
      await signIn(role);
      navigate(next && (!area || AREA_ROLES[area].includes(role)) ? next : role === 'admin' ? '/institucion' : '/', { replace: true });
    } finally {
      setPending(null);
    }
  };
  return (
    <>
      <PageHeader eyebrow="Dos experiencias · Tucanthon" title="¿Cómo quieres entrar a Ondara?"
        description="La ciudadanía aporta observaciones; el personal del sector salud analiza y administra. Los accesos son completamente simulados." />
      <Notice tone="caution" title="Sesiones de demostración" icon={ShieldAlert} className="mb-7">
        No hay cuentas ni contraseñas reales. Los controles de acceso son únicamente visuales y no deben utilizarse con datos reales.
      </Notice>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[20px] bg-keylime-wash p-6 sm:p-8" aria-labelledby="acceso-ciudadano">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-cream-paper text-forest-ink"><CircleUserRound className="size-7" /></span>
          <p className="eyebrow mt-5">Portal público</p>
          <h2 id="acceso-ciudadano" className="mt-2 text-[2rem]">Usuarios y ciudadanía</h2>
          <p className="mt-3 leading-relaxed">Conoce las señales de tu zona, consulta campañas y envía una observación sin identificarte. Los aliados comunitarios usan este mismo portal.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink to="/reportar">Enviar un reporte</ButtonLink>
            <ButtonLink to="/mapa" variant="secondary">Explorar el mapa</ButtonLink>
          </div>
          <div className="mt-6 rounded-xl bg-cream-paper p-4">
            <p className="flex items-center gap-2 font-semibold text-forest-ink"><HeartHandshake className="size-5" /> Modo aliado comunitario</p>
            <p className="mt-1 text-sm text-muted">Un mismo acceso público permite facilitar reportes mediante un código QR o enlace precargado.</p>
          </div>
          <div className="mt-5 border-t border-forest-ink/15 pt-4">
            <p className="mb-3 text-sm">Opcional: activar una sesión ficticia para consultar «Mis reportes».</p>
            <Button variant="secondary" icon={ClipboardCheck} loading={pending === 'ciudadano'} disabled={pending === 'admin'} onClick={() => choose('ciudadano')}>
              {currentRole === 'ciudadano' ? 'Continuar como ciudadano DEMO' : 'Activar sesión de usuario DEMO'}
            </Button>
          </div>
        </section>
        <section className="rounded-[20px] bg-slate-hush p-6 sm:p-8" aria-labelledby="acceso-salud">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-cream-paper text-forest-ink"><Building2 className="size-7" /></span>
          <p className="eyebrow mt-5">Portal institucional</p>
          <h2 id="acceso-salud" className="mt-2 text-[2rem]">Administrador del sector salud</h2>
          <p className="mt-3 leading-relaxed">Accede a la vigilancia epidemiológica, los datos agregados, zonas prioritarias, revisión de reportes, decisiones e intervenciones simuladas.</p>
          <div className="mt-6 space-y-3 rounded-xl bg-cream-paper p-5">
            <p className="font-semibold text-forest-ink">Herramientas del administrador</p>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
              <li>Consultar señales y comparar zonas epidemiológicas.</li>
              <li>Validar observaciones, canalizarlas y documentar su seguimiento.</li>
              <li>Revisar fuentes, indicadores y la bitácora DEMO.</li>
            </ul>
            <Button className="mt-3 w-full" loading={pending === 'admin'} disabled={pending === 'ciudadano'} onClick={() => choose('admin')}>
              {currentRole === 'admin' ? 'Continuar como administrador DEMO' : 'Entrar como administrador del sector salud'}
            </Button>
          </div>
        </section>
      </div>
      <p className="mt-6 text-sm text-muted">La plataforma funciona con dos perfiles simulados. La moderación forma parte del portal institucional, sin una tercera sesión de operador Ondara.</p>
    </>
  );
}
