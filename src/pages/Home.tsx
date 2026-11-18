import {
  Activity,
  ArrowRight,
  Check,
  Info,
  Map,
  Megaphone,
  Scale,
  Syringe,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sparkline } from '../components/charts/Sparkline';
import { DataKindBadge, DemoBadge } from '../components/ui/Badges';
import { ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { Section, SourceNote } from '../components/ui/Layout';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { diseaseCategoryLabels } from '../mocks/diseases';
import { regionName } from '../mocks/regions';
import { getHomeSummary, type DiseaseSummary } from '../services/epidemiologyService';
import type { Alert } from '../types';
import { formatDate } from '../utils/dates';
import { formatNumber } from '../utils/format';

const IS = [
  'Un canal para que la ciudadanía aporte observaciones breves de salud pública, sin cuenta y sin datos personales.',
  'Un tablero que muestra, por separado, datos oficiales, indicadores estimados y reportes ciudadanos.',
  'Un apoyo para que la autoridad revise, canalice y dé seguimiento documentado a las observaciones útiles.',
];

const IS_NOT = [
  'No diagnostica ni confirma casos o brotes.',
  'No emite alertas oficiales ni sustituye la vigilancia epidemiológica.',
  'No cobra a la ciudadanía por enviar reportes ni ofrece intermediación clínica.',
  'No publica domicilios ni ubicaciones de personas.',
];

const QUICK_LINKS: Array<{ to: string; title: string; text: string; icon: LucideIcon }> = [
  { to: '/mapa', title: 'Mapa por capas', text: 'Datos agregados por zona, cada tipo en su propia capa.', icon: Map },
  { to: '/brigadas', title: 'Brigadas y campañas', text: 'Vacunación y prevención por zona, fecha y horario.', icon: Syringe },
  { to: '/reportes', title: 'Enviar un reporte', text: 'Una observación breve, anónima y por zona.', icon: Megaphone },
  { to: '/normativa', title: 'Normativa y fuentes', text: 'Marcos a revisar y procedencia de los datos.', icon: Scale },
  { to: '/enfermedades', title: 'Enfermedades y señales', text: 'Tendencias y criterios transparentes.', icon: Activity },
];

export default function Home() {
  useDocumentTitle('Inicio');
  const { data, loading, error, reload } = useAsync(getHomeSummary, []);

  return (
    <>
      {/* Hero */}
      <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]" aria-labelledby="hero-title">
        <div className="panel-keylime flex flex-col justify-between gap-8">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="eyebrow">Ondara Cancún · Plataforma participativa</p>
              <DemoBadge />
            </div>
            <h1 id="hero-title" className="title-display text-[42px] sm:text-[56px] xl:text-[68px]">
              Lo que observa la ciudad, ordenado para quien puede actuar.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] text-ink">
              Ondara reúne observaciones ciudadanas y datos públicos de salud por zonas de Cancún, sin mezclarlos, para apoyar a las
              autoridades sanitarias. Complementa la vigilancia oficial; no la sustituye.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/reportes" className="btn btn-primary">
              Enviar un reporte
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link to="/mapa" className="btn btn-ghost bg-cream">
              Ver el mapa por capas
            </Link>
          </div>
        </div>

        <div className="panel-slate">
          <div className="rounded-[14px] bg-cream p-5 md:p-6">
            <p className="eyebrow mb-3">Qué es Ondara</p>
            <ul className="space-y-3">
              {IS.map((t) => (
                <li key={t} className="flex gap-3 text-[15px]">
                  <Check aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-3 rounded-[14px] bg-cream p-5 md:p-6">
            <p className="eyebrow mb-3">Qué no es</p>
            <ul className="space-y-3">
              {IS_NOT.map((t) => (
                <li key={t} className="flex gap-3 text-[15px]">
                  <X aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Notice tone="info" className="mt-4" title="Un reporte ciudadano es una observación, no un caso clínico confirmado.">
        Una mayor cantidad de reportes puede reflejar más participación, no necesariamente más riesgo sanitario.
      </Notice>

      {loading && (
        <div className="mt-12">
          <LoadingState label="Cargando resumen DEMO…" />
        </div>
      )}
      {error && (
        <div className="mt-12">
          <ErrorState error={error} onRetry={reload} />
        </div>
      )}
      {data && (
        <>
          <Section
            id="avisos"
            eyebrow="Avisos informativos"
            title="Cambios recientes en los datos"
            description="Cada aviso indica su fuente, fecha, criterio y limitación. No son alertas sanitarias oficiales."
          >
            <div className="grid gap-4 md:grid-cols-3">
              {data.alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </Section>

          <Section
            id="resumen"
            eyebrow="Monitoreo DEMO"
            title="Enfermedades y señales monitoreadas"
            description={
              <>
                Registros agregados de las últimas 4 semanas frente a las 4 anteriores, para todo Cancún.{' '}
                {formatNumber(data.reportsLast4Weeks)} reportes ciudadanos recibidos en el mismo periodo se muestran aparte.
              </>
            }
            actions={
              <Link to="/enfermedades" className="btn btn-secondary btn-sm">
                Ver catálogo completo
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            }
          >
            <SummaryTable summaries={data.summaries} />
            <SourceNote source={data.source} cutoffDate={data.cutoffDate}>
              <span>Limitación: datos simulados con retraso de notificación; no reflejan incidencia real.</span>
            </SourceNote>
          </Section>
        </>
      )}

      <Section id="accesos" eyebrow="Accesos rápidos" title="¿Qué quieres hacer?">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((q) => (
            <li key={q.to}>
              <Link
                to={q.to}
                className="group flex h-full items-start gap-4 rounded-[14px] bg-paper p-5 transition-colors hover:bg-keylime"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream text-forest">
                  <q.icon aria-hidden className="h-5 w-5" />
                </span>
                <span>
                  <span className="flex items-center gap-2 font-semibold text-forest">
                    {q.title}
                    <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1 block text-[14.5px] text-muted">{q.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const kind = alert.source.startsWith('Reportes ciudadanos') ? 'ciudadano' : alert.source.startsWith('Calendario') ? 'brigada' : 'oficial';
  return (
    <article className="card flex flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="pill bg-info-bg text-info">
          <Info aria-hidden className="h-3.5 w-3.5" />
          {alert.level === 'seguimiento' ? 'Aviso de seguimiento' : 'Aviso informativo'}
        </span>
        <DataKindBadge kind={kind} short />
      </div>
      <h3 className="text-[18px] font-semibold leading-snug text-forest">{alert.title}</h3>
      <p className="mt-2 text-[14.5px]">{alert.summary}</p>
      <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-[13.5px]">
        <div>
          <dt className="inline font-semibold">Fuente: </dt>
          <dd className="inline text-muted">{alert.source}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Fecha: </dt>
          <dd className="inline text-muted">
            {formatDate(alert.date)}
            {alert.regionId && ` · ${regionName(alert.regionId)}`}
          </dd>
        </div>
        <div>
          <dt className="inline font-semibold">Criterio: </dt>
          <dd className="inline text-muted">{alert.criteria}</dd>
        </div>
        <div>
          <dt className="inline font-semibold">Limitación: </dt>
          <dd className="inline text-muted">{alert.limitations}</dd>
        </div>
      </dl>
      {alert.diseaseId && (
        <Link to={`/enfermedades/${alert.diseaseId}`} className="link mt-4 text-[14px]">
          Ver tendencia y criterio
        </Link>
      )}
    </article>
  );
}

function SummaryTable({ summaries }: { summaries: DiseaseSummary[] }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="sr-only">Registros DEMO por enfermedad: últimas 4 semanas frente a las 4 anteriores</caption>
        <thead>
          <tr>
            <th scope="col">Enfermedad o señal</th>
            <th scope="col">Clasificación</th>
            <th scope="col" className="num">
              Últimas 4 sem.
            </th>
            <th scope="col" className="num">
              4 sem. previas
            </th>
            <th scope="col">Tendencia (12 sem.)</th>
            <th scope="col">Señal</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map(({ disease, last4, previous4, series, signal }) => (
            <tr key={disease.id}>
              <th scope="row" className="!bg-transparent font-medium">
                <Link to={`/enfermedades/${disease.id}`} className="link">
                  {disease.name}
                </Link>
              </th>
              <td className="text-muted">{diseaseCategoryLabels[disease.category]}</td>
              <td className="num">{formatNumber(last4)}</td>
              <td className="num">{formatNumber(previous4)}</td>
              <td>
                <Sparkline
                  values={series}
                  label={`${disease.name}: tendencia de 12 semanas, último valor ${formatNumber(series[series.length - 1] ?? 0)} registros DEMO`}
                />
              </td>
              <td>
                {signal.triggered ? (
                  <span className="pill bg-caution-bg text-caution">Cambio sobre línea base</span>
                ) : signal.meetsMinimum ? (
                  <span className="pill bg-paper text-muted">Sin cambio inusual</span>
                ) : (
                  <span className="pill bg-paper text-muted">Datos insuficientes</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
