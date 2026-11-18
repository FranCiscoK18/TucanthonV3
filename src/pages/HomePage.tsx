import {
  ArrowRight,
  BookOpenText,
  Check,
  Map as MapIcon,
  MessageSquarePlus,
  Syringe,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router';
import { AlertCard } from '../components/AlertCard';
import { Sparkline } from '../components/charts/Sparkline';
import { ButtonLink } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';
import { SectionHeading } from '../components/ui/PageHeader';
import { ChangeText, SignalBadge } from '../components/ui/SignalBadge';
import { SourceMeta } from '../components/ui/SourceMeta';
import { AsyncContent, LoadingState, Skeleton } from '../components/ui/States';
import { Waves } from '../components/ui/Waves';
import { TEXTS } from '../config/texts';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getActivitiesMock } from '../mocks/activities';
import { categoryLabels } from '../mocks/diseases';
import { regionName } from '../mocks/regions';
import { getAlerts } from '../services/alertService';
import { getDiseaseCatalog, type DiseaseCatalog } from '../services/epidemiologyService';
import { getParticipationSummary, type ParticipationSummary } from '../services/mapService';
import { formatDate, formatDateLong } from '../utils/dates';
import { formatDecimal, formatInteger } from '../utils/format';
import { getDemoClock } from '../mocks/clock';

const IS_ITEMS = [
  'Un lugar para consultar información de salud por zonas amplias de Cancún, con fuente y fecha de corte.',
  'Un canal para enviar observaciones breves sin descarga ni cuenta: sitio móvil, códigos QR o aliados comunitarios.',
  'Un apoyo que ordena, revisa y canaliza esas observaciones a la autoridad competente, con seguimiento visible.',
  'Un complemento de la vigilancia oficial.',
];

const IS_NOT_ITEMS = [
  'No diagnostica ni confirma casos o brotes.',
  'No emite alertas oficiales ni sustituye a la autoridad sanitaria.',
  'No publica domicilios ni ubicaciones de personas enfermas.',
  'No cobra por reportar ni recibe comisiones por pacientes o referencias.',
  'No garantiza que la autoridad actúe sobre un reporte.',
];

interface QuickLink {
  to: string;
  title: string;
  text: string;
  icon: LucideIcon;
}

/** «Enviar un reporte» no se repite aquí: ya es la acción secundaria del hero. */
const QUICK_LINKS: QuickLink[] = [
  { to: '/mapa', title: 'Mapa epidemiológico', text: 'Registros, reportes y brigadas por zona.', icon: MapIcon },
  { to: '/enfermedades', title: 'Enfermedades y señales', text: 'Tendencias y cómo se detecta una señal.', icon: BookOpenText },
  { to: '/brigadas', title: 'Brigadas y campañas', text: 'Vacunación y prevención cerca de ti.', icon: Syringe },
];

/** Filas de la tabla de Inicio: primero las señales activas y luego las de más registros. */
const HOME_TABLE_ROWS = 6;

function homeRows(items: DiseaseCatalog['items']): DiseaseCatalog['items'] {
  return [...items]
    .sort((a, b) => Number(b.signal.status === 'senal') - Number(a.signal.status === 'senal') || b.last4 - a.last4)
    .slice(0, HOME_TABLE_ROWS);
}

function HeroPreview({ catalog, participation }: { catalog?: DiseaseCatalog; participation?: ParticipationSummary }) {
  const { today } = getDemoClock();
  const nextActivity = getActivitiesMock()
    .filter((activity) => activity.date >= today && activity.status !== 'finalizada')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))[0];
  const signal = catalog?.items.find((item) => item.signal.status === 'senal');

  return (
    <div className="grid gap-3" aria-label="Vista previa de indicadores ilustrativos">
      <div className="rounded-card bg-cream-paper p-5">
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-muted">Corte {catalog ? formatDate(catalog.cutoff) : '…'}</span>
        </div>
        {signal ? (
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Señal estadística activa</p>
              <p className="font-serif text-[1.625rem] leading-tight text-forest-ink">{signal.disease.name}</p>
              <p className="mt-1 text-sm">{formatDecimal(signal.signal.ratio ?? 0)}× lo esperado según su línea base</p>
            </div>
            <Sparkline values={signal.sparkline} label={`Tendencia de 8 semanas de ${signal.disease.name} (referencia)`} />
          </div>
        ) : (
          <Skeleton className="mt-3 h-16" />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-card bg-cream-paper p-5">
          <p className="mt-3 text-sm text-muted">Reportes esta semana</p>
          <p className="text-[1.75rem] font-semibold leading-tight text-charcoal">{participation?.thisWeek.display ?? '…'}</p>
          <p className="text-xs text-muted">Sin verificar: {participation?.unverified.display ?? '…'}</p>
        </div>
        <div className="rounded-card bg-cream-paper p-5">
          <p className="mt-3 text-sm text-muted">Próxima brigada</p>
          {nextActivity ? (
            <>
              <p className="font-medium leading-snug text-charcoal">{nextActivity.title}</p>
              <p className="mt-1 text-xs text-muted">
                {formatDateLong(nextActivity.date)} · {regionName(nextActivity.regionId)}
              </p>
            </>
          ) : (
            <p className="text-sm">Sin actividades próximas</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  useDocumentTitle('Inicio');
  const catalog = useAsync(getDiseaseCatalog, []);
  const alerts = useAsync(getAlerts, []);
  const participation = useAsync(getParticipationSummary, []);

  return (
    <div className="space-y-16">
      <section aria-labelledby="hero-titulo" className="relative overflow-hidden rounded-[22px] bg-keylime-wash animate-rise">
        <div className="grid grid-cols-1 gap-8 p-6 pb-20 sm:p-10 sm:pb-24 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow">Plataforma de Inteligencia Epidemiológica Participativa</p>
            </div>
            <h1 id="hero-titulo" className="mt-4 text-[2.5rem] sm:text-[3.5rem]">
              Información de salud por zonas y un canal ciudadano para Cancún
            </h1>
            <p className="mt-4 max-w-xl text-[1.125rem] leading-relaxed text-charcoal">
              Ondara reúne datos públicos y observaciones de la ciudadanía para que la autoridad decida mejor.{' '}
              <strong className="font-semibold text-forest-ink">Complementa, no sustituye, la vigilancia oficial.</strong>
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink to="/mapa" icon={MapIcon}>
                Ver el mapa
              </ButtonLink>
              <ButtonLink to="/reportar" variant="secondary" icon={MessageSquarePlus}>
                Enviar un reporte sin cuenta
              </ButtonLink>
            </div>
          </div>
          <div className="rounded-[18px] bg-slate-hush p-4 sm:p-5">
            <HeroPreview catalog={catalog.data} participation={participation.data} />
          </div>
        </div>
        <Waves className="absolute inset-x-0 bottom-0 h-16 w-full sm:h-20" />
      </section>

      <section aria-labelledby="accesos">
        <SectionHeading id="accesos" title="Accesos rápidos" description="Las funciones públicas no requieren descarga ni cuenta." />
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="group flex h-full items-start gap-4 rounded-card bg-keylime-wash p-5 transition-colors hover:bg-mint-veil"
                >
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-cream-paper text-forest-ink">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 font-semibold text-forest-ink">
                      {link.title}
                      <ArrowRight
                        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">{link.text}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="que-es" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card card-keylime">
          <h2 id="que-es" className="text-[1.75rem]">
            Qué es Ondara
          </h2>
          <ul className="mt-4 space-y-3">
            {IS_ITEMS.map((item) => (
              <li key={item} className="flex gap-3 leading-relaxed">
                <Check className="mt-1 size-5 shrink-0 text-forest-ink" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="card card-cream">
          <h2 className="text-[1.75rem]">Qué no es</h2>
          <ul className="mt-4 space-y-3">
            {IS_NOT_ITEMS.map((item) => (
              <li key={item} className="flex gap-3 leading-relaxed">
                <X className="mt-1 size-5 shrink-0 text-ciudadano-700" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="resumen">
        <SectionHeading
          id="resumen"
          eyebrow="Datos epidemiológicos ilustrativos"
          title="Enfermedades y señales monitoreadas"
          description="Registros agregados de toda la ciudad. La columna «Cambio» compara las últimas 4 semanas con las 4 previas; la regla de señal usa otra ventana (2 semanas frente a las 8 anteriores)."
          actions={
            <ButtonLink to="/enfermedades" variant="secondary" size="sm" icon={ArrowRight} iconPosition="end">
              Ver catálogo completo
            </ButtonLink>
          }
        />
        <AsyncContent resource={catalog.resource} onRetry={catalog.reload} loading={<LoadingState lines={4} />}>
          {(data) => (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_20rem]">
              <div className="relative overflow-x-auto rounded-card border border-border-mist" tabIndex={0} aria-label="Tabla de resumen, desplazable">
                <table className="table-base min-w-[40rem]">
                  <caption className="sr-only">
                    Resumen ilustrativo de las {HOME_TABLE_ROWS} enfermedades o señales más relevantes, últimas 4 semanas, con estado de
                    la regla de señal
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Enfermedad o señal</th>
                      <th scope="col">Clasificación</th>
                      <th scope="col" className="text-right">
                        Últimas 4 sem.
                      </th>
                      <th scope="col">Cambio vs. 4 sem. previas</th>
                      <th scope="col">Regla de señal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeRows(data.items).map((item) => (
                      <tr key={item.disease.id}>
                        <th scope="row" className="font-medium">
                          <Link className="link" to={`/enfermedades/${item.disease.id}`}>
                            {item.disease.name}
                          </Link>
                        </th>
                        <td className="text-muted">{categoryLabels[item.disease.category]}</td>
                        <td className="text-right font-semibold tabular-nums">{formatInteger(item.last4)}</td>
                        <td>
                          <ChangeText current={item.last4} previous={item.previous4} />
                        </td>
                        <td>
                          <SignalBadge status={item.signal.status} ratio={item.signal.ratio} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-3">
                <SourceMeta source={data.source} compact />
                <Notice tone="info">{TEXTS.signalDisclaimer}</Notice>
              </div>
            </div>
          )}
        </AsyncContent>
      </section>

      <section aria-labelledby="avisos">
        <SectionHeading
          id="avisos"
          title="Avisos informativos"
          description="Cada aviso indica su fuente, fecha, criterio y limitación. Ninguno es una alerta oficial."
        />
        <AsyncContent resource={alerts.resource} onRetry={alerts.reload} loading={<LoadingState lines={2} />}>
          {(data) => (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.map((alert) => (
                <li key={alert.id}>
                  <AlertCard alert={alert} compact />
                </li>
              ))}
            </ul>
          )}
        </AsyncContent>
      </section>

    </div>
  );
}
