import { Building2, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useSession } from '../app/session';
import { Button, ButtonLink } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const DEMO_USER = 'salud@ondara.demo';
const DEMO_PASSWORD = 'ONDARA2026';

function safeDestination(value: string | null): string {
  if (value && (value === '/institucion' || value.startsWith('/institucion?') || value === '/administracion' || value.startsWith('/administracion?'))) return value;
  return '/institucion';
}

export function LoginPage() {
  useDocumentTitle('Acceso administrativo · Ondara');
  const { role, signIn } = useSession();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (user.trim().toLowerCase() !== DEMO_USER || password !== DEMO_PASSWORD) {
      setError('Usuario o contraseña incorrectos.');
      return;
    }
    setError('');
    setPending(true);
    try {
      await signIn('admin');
      navigate(safeDestination(params.get('siguiente')), {replace: true});
    } catch {
      setError('No se pudo iniciar sesión. Intenta de nuevo.');
    } finally { setPending(false); }
  };
  return (
    <div className="mx-auto max-w-5xl py-6 lg:py-12">
      <div className="grid overflow-hidden rounded-[22px] border border-border-mist lg:grid-cols-2">
        <section className="bg-slate-hush p-7 sm:p-10 lg:p-12" aria-labelledby="admin-presentacion">
          <div className="inline-flex size-14 items-center justify-center rounded-[18px] bg-cream-paper text-forest-ink"><Building2 className="size-7" /></div>
          <p className="eyebrow mt-8">Portal institucional</p>
          <h1 id="admin-presentacion" className="mt-3 text-[2.3rem] sm:text-[3rem]">Centro de vigilancia epidemiológica</h1>
          <p className="mt-5 leading-relaxed">Un espacio de trabajo para que el administrador de salud explore tendencias, observe zonas prioritarias, revise reportes ciudadanos y documente su seguimiento.</p>
          <Link to="/" className="link mt-8 inline-block text-sm">Volver a la portada pública</Link>
        </section>
        <section className="bg-cream-paper p-7 sm:p-10 lg:p-12" aria-labelledby="admin-login-titulo">
          {role === 'admin' ? (
            <div className="flex h-full flex-col justify-center">
              <p className="eyebrow">Sesión activa</p>
              <h2 id="admin-login-titulo" className="mt-3 text-[2rem]">Ya tienes acceso al panel</h2>
              <p className="mt-3 text-muted">El perfil administrativo está habilitado en este navegador.</p>
              <ButtonLink to="/institucion" className="mt-7">Ir al centro de vigilancia</ButtonLink>
              <ButtonLink to="/administracion" className="mt-3" variant="secondary">Gestionar reportes</ButtonLink>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className="eyebrow">Inicio de sesión</p>
              <h2 id="admin-login-titulo" className="mt-2 text-[2rem]">Acceso administrativo</h2>
              <p className="mt-2 text-sm text-muted">Ingresa con tu usuario y contraseña para acceder al panel institucional.</p>
              <div className="mt-7">
                <label htmlFor="admin-usuario" className="block text-sm font-semibold text-forest-ink">Usuario</label>
                <input id="admin-usuario" type="text" autoComplete="username" value={user} onChange={e=>setUser(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-line bg-cream-paper px-4 py-3" required />
              </div>
              <div className="mt-5">
                <label htmlFor="admin-clave" className="block text-sm font-semibold text-forest-ink">Contraseña</label>
                <div className="relative mt-2">
                  <input id="admin-clave" type={visible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}
                    className="w-full rounded-xl border border-line bg-cream-paper px-4 py-3 pr-14" required />
                  <button type="button" onClick={()=>setVisible(!visible)} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-forest-ink">
                    {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              {error && <p className="mt-4 rounded-xl bg-danger-50 p-3 text-sm text-danger-700" role="alert">{error}</p>}
              <Button type="submit" loading={pending} disabled={pending} className="mt-7 w-full" icon={LockKeyhole}>Entrar al panel del sector salud</Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
