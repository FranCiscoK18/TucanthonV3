import { Activity, ArrowRight, BookOpenText, Building2, Check, ClipboardCheck, MapPinned, MessageSquarePlus, ShieldCheck, Syringe, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router';
import { ButtonLink } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const FEATURES = [
  { title: 'Mapa epidemiológico', text: 'Explora indicadores por zonas amplias de Cancún, con periodos y fuentes identificadas.', to: '/mapa', icon: MapPinned, tone: 'bg-estimado-50' },
  { title: 'Enfermedades y señales', text: 'Consulta tendencias, información preventiva y criterios de vigilancia.', to: '/enfermedades', icon: BookOpenText, tone: 'bg-keylime-wash' },
  { title: 'Brigadas y campañas', text: 'Conoce cómo se presentan las jornadas preventivas y las próximas actividades en el mapa.', to: '/brigadas', icon: Syringe, tone: 'bg-brigada-50' },
  { title: 'Participación ciudadana', text: 'Comparte una observación de tu entorno sin registrarte y sigue su estado en este navegador.', to: '/reportar', icon: MessageSquarePlus, tone: 'bg-ciudadano-50' },
] as const;

export function LandingPage() {
  useDocumentTitle('Bienvenido a Ondara Cancún');
  return (
    <div className="space-y-20 pb-8">
      <section className="relative isolate overflow-hidden rounded-[24px] bg-keylime-wash">
        <div className="pointer-events-none absolute -right-24 -top-40 size-96 rounded-full bg-sage-mist/50 blur-3xl" aria-hidden="true" />
        <div className="relative grid items-center gap-10 p-6 py-12 sm:p-10 sm:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:p-14 lg:py-20">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow">ONDARA · CANCÚN</span>
            </div>
            <h1 className="mt-5 max-w-[14ch] text-[clamp(2.75rem,5.1vw,5rem)] leading-[1.06]">
              La prevención empieza con información.
            </h1>
            <p className="mt-6 max-w-xl text-[1.125rem] leading-relaxed text-charcoal">
              Una plataforma de inteligencia epidemiológica participativa que reúne datos, observaciones ciudadanas y contexto territorial para apoyar la vigilancia y la prevención en Cancún.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Ondara no diagnostica ni sustituye a las autoridades sanitarias.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/inicio" icon={ArrowRight} iconPosition="end">Explorar la plataforma</ButtonLink>
              <ButtonLink to="/reportar" variant="secondary" icon={MessageSquarePlus}>Enviar una observación</ButtonLink>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-2 text-sm text-forest-ink">
              <Check className="size-4" aria-hidden="true" />
              <span>Información abierta · Sin registro ciudadano · Seguimiento local</span>
            </div>
          </div>
          <div className="relative" aria-label="Vista ilustrativa del funcionamiento de Ondara">
            <div className="rounded-[20px] bg-slate-hush p-4 sm:p-6">
              <div className="rounded-[16px] bg-cream-paper p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-forest-ink"><Activity className="size-4" /> Panorama de vigilancia</span>
                  <span className="rounded-full bg-keylime-wash px-3 py-1 text-xs font-medium text-forest-ink">Vista conceptual</span>
                </div>
                <p className="mt-4 text-[1.4rem] font-medium text-forest-ink">Señales + territorio + comunidad</p>
                <p className="mt-1 text-sm text-muted">Tres fuentes complementarias, claramente diferenciadas</p>
                <div className="mt-5 space-y-3" aria-hidden="true">
                  <div className="flex items-center gap-3 rounded-xl bg-estimado-50 p-3"><span className="flex size-9 items-center justify-center rounded-lg bg-white text-estimado-700"><TrendingUp className="size-5" /></span><div className="flex-1"><p className="text-sm font-semibold">Tendencias epidemiológicas</p><div className="mt-1 h-1.5 w-4/5 rounded-full bg-estimado-500/50" /></div></div>
                  <div className="flex items-center gap-3 rounded-xl bg-ciudadano-50 p-3"><span className="flex size-9 items-center justify-center rounded-lg bg-white text-ciudadano-700"><Users className="size-5" /></span><div className="flex-1"><p className="text-sm font-semibold">Observaciones ciudadanas</p><div className="mt-1 h-1.5 w-2/3 rounded-full bg-ciudadano-500/50" /></div></div>
                  <div className="flex items-center gap-3 rounded-xl bg-keylime-wash p-3"><span className="flex size-9 items-center justify-center rounded-lg bg-white text-forest-ink"><ClipboardCheck className="size-5" /></span><div className="flex-1"><p className="text-sm font-semibold">Revisión y seguimiento</p><div className="mt-1 h-1.5 w-3/4 rounded-full bg-oficial-500/45" /></div></div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border-mist px-3 py-1 text-xs">Dengue</span>
                  <span className="rounded-full border border-border-mist px-3 py-1 text-xs">Influenza</span>
                  <span className="rounded-full border border-border-mist px-3 py-1 text-xs">COVID-19</span>
                  <span className="rounded-full border border-border-mist px-3 py-1 text-xs">Sarampión</span>
                  <span className="rounded-full border border-border-mist px-3 py-1 text-xs">Y más</span>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-charcoal">Vista ilustrativa; los indicadores no representan datos epidemiológicos reales.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="landing-funciones">
        <div className="mb-7 max-w-3xl">
          <p className="eyebrow">Todo lo que puedes consultar</p>
          <h2 id="landing-funciones" className="mt-2 text-[2rem] sm:text-[2.7rem]">La información que necesitas, en un solo lugar</h2>
          <p className="mt-3 text-muted">Explora los apartados públicos sin iniciar sesión, desde tu computadora o celular.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {FEATURES.map(({ title, text, to, icon: Icon, tone }) => (
            <Link key={to} to={to} className={`group flex h-full flex-col rounded-[18px] p-6 transition-transform hover:-translate-y-0.5 ${tone}`}>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-cream-paper text-forest-ink"><Icon className="size-6" /></span>
              <h3 className="mt-5 text-[1.5rem]">{title}</h3>
              <p className="mt-2 flex-1 leading-relaxed text-muted">{text}</p>
              <span className="mt-5 inline-flex items-center gap-2 font-semibold text-forest-ink">Abrir apartado <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2" aria-label="Para quién es Ondara">
        <div className="rounded-[20px] bg-keylime-wash p-7 sm:p-9">
          <Users className="size-8 text-forest-ink" />
          <p className="eyebrow mt-5">Para la comunidad</p>
          <h2 className="mt-2 text-[2rem]">Consulta, participa y da seguimiento</h2>
          <p className="mt-3 leading-relaxed">La ciudadanía accede libremente a mapas, información preventiva y campañas. Si observa un posible riesgo ambiental, puede reportarlo y consultar después su estado en el mismo navegador.</p>
          <ButtonLink to="/mis-reportes" variant="secondary" className="mt-6">Mis reportes · sin cuenta</ButtonLink>
        </div>
        <div className="rounded-[20px] bg-slate-hush p-7 sm:p-9">
          <Building2 className="size-8 text-forest-ink" />
          <p className="eyebrow mt-5">Para el sector salud</p>
          <h2 className="mt-2 text-[2rem]">Analiza información para orientar decisiones</h2>
          <p className="mt-3 leading-relaxed">El personal administrador cuenta con vistas de vigilancia, zonas prioritarias, revisión de reportes y seguimiento de acciones.</p>
        </div>
      </section>

      <section className="rounded-[22px] bg-forest-ink px-6 py-10 text-cream-paper sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-sage-mist">Participación abierta</p>
          <h2 className="mt-3 text-[2rem] text-cream-paper sm:text-[2.7rem]">Tu entorno también cuenta.</h2>
          <p className="mt-3 text-cream-paper/85">Conoce cómo la participación comunitaria puede apoyar la vigilancia y la prevención.</p>
        </div>
        <div className="mt-6 flex shrink-0 flex-wrap gap-3 lg:mt-0">
          <ButtonLink to="/mapa" variant="secondary" icon={MapPinned}>Ver mapa</ButtonLink>
          <ButtonLink to="/reportar" variant="secondary" icon={MessageSquarePlus}>Enviar reporte</ButtonLink>
        </div>
      </section>
      <Notice tone="integrity" title="Integridad de la información">
        <ShieldCheck className="mr-1 inline size-4" aria-hidden="true" />
        Las observaciones ciudadanas no confirman casos ni brotes. Los indicadores mostrados utilizan datos ilustrativos y no representan condiciones reales de salud.
      </Notice>
    </div>
  );
}
