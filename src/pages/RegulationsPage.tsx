import { Gavel } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { DataKindBadge, DemoTag, Pill } from '../components/ui/Badges';
import { Notice } from '../components/ui/Notice';
import { PageHeader, SectionHeading } from '../components/ui/PageHeader';
import { AsyncContent, LoadingState } from '../components/ui/States';
import { TEXTS } from '../config/texts';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getDataSources, sourceStatusLabels } from '../services/sourceService';
import { formatDate } from '../utils/dates';

interface Framework {
  name: string;
  scope: string;
  why: string;
  review: string;
}

/** Marcos a revisar. Es una lista de trabajo, no una interpretación jurídica. */
const FRAMEWORKS: Framework[] = [
  {
    name: 'NOM-017-SSA2-2012, para la vigilancia epidemiológica',
    scope: 'Federal · salud',
    why: 'Regula la vigilancia epidemiológica oficial. Ondara no notifica casos ni sustituye ese sistema.',
    review: 'Relación entre observaciones ciudadanas y notificación oficial; lenguaje sobre casos; canalización a la autoridad.',
  },
  {
    name: 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares (2025)',
    scope: 'Federal · particulares',
    why: 'Aplicaría si un particular opera la plataforma. Los datos de salud se consideran sensibles.',
    review: 'Aviso de privacidad, minimización de datos, derechos de las personas titulares y transferencias.',
  },
  {
    name: 'Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (2025)',
    scope: 'General · sector público',
    why: 'Aplicaría a las autoridades que reciban información canalizada o participen en el piloto.',
    review: 'Finalidades, convenios entre instituciones y transferencias entre sujetos obligados.',
  },
  {
    name: 'Ley local de Quintana Roo en materia de datos personales en posesión de sujetos obligados',
    scope: 'Estatal · Quintana Roo',
    why: 'Aplicaría si participan dependencias estatales o municipales.',
    review: 'Armonización con la ley general de 2025 y avisos de privacidad de las dependencias locales.',
  },
  {
    name: 'Ley federal de adquisiciones (2025)',
    scope: 'Federal · contratación pública',
    why: 'Aplicaría si una dependencia federal contratara el servicio. Esta DEMO no presupone ningún subsidio ni adjudicación.',
    review: 'Procedimientos de contratación y requisitos para servicios tecnológicos.',
  },
  {
    name: 'Normativa estatal o municipal aplicable',
    scope: 'Estatal y municipal (Benito Juárez)',
    why: 'Salud, protección civil, adquisiciones locales y uso de espacios públicos.',
    review: 'Permisos para colocar códigos QR en espacios públicos; convenios con el municipio; reglas de protección civil.',
  },
];

export function RegulationsPage() {
  useDocumentTitle('Normativa y fuentes');
  const { resource, data, reload } = useAsync(getDataSources, []);
  const location = useLocation();

  // Los enlaces «Fuente» llegan con un ancla: desplaza hasta la ficha cuando la lista termina de cargar.
  useEffect(() => {
    if (!data || !location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    target.focus({ preventScroll: true });
  }, [data, location.hash]);

  return (
    <>
      <PageHeader
        eyebrow="Transparencia"
        title="Normativa y fuentes"
        description="Marcos legales que conviene revisar antes de operar Ondara, y las fuentes de datos que usa esta DEMO."
      />

      <Notice tone="caution" title="Aviso" icon={Gavel} className="mb-8 text-[1rem]">
        {TEXTS.regulationsNotice}
      </Notice>

      <section aria-labelledby="marcos">
        <SectionHeading
          id="marcos"
          title="Marcos a revisar"
          description="Lista de trabajo para el equipo jurídico. El estado de revisión es simulado."
        />
        <div className="relative overflow-x-auto rounded-card border border-border-mist" tabIndex={0} aria-label="Tabla de marcos legales, desplazable">
          <table className="table-base min-w-[52rem]">
            <caption className="sr-only">Marcos legales a revisar para la operación de Ondara</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[28%]">
                  Marco
                </th>
                <th scope="col">Ámbito</th>
                <th scope="col">Por qué revisarlo</th>
                <th scope="col">Qué revisar</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {FRAMEWORKS.map((framework) => (
                <tr key={framework.name}>
                  <th scope="row" className="font-semibold text-charcoal">
                    {framework.name}
                  </th>
                  <td className="text-muted">{framework.scope}</td>
                  <td>{framework.why}</td>
                  <td>{framework.review}</td>
                  <td>
                    <Pill tone="warning">Por revisar · DEMO</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="fuentes" className="mt-16">
        <SectionHeading
          id="fuentes"
          title="Fuentes de datos DEMO"
          description={TEXTS.demoData}
        />
        <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={4} />}>
          {(sources) => (
            <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {sources.map((source) => (
                <li key={source.id} id={source.id} tabIndex={-1} className="card card-cream scroll-mt-24 outline-none focus-visible:ring-3 focus-visible:ring-forest-ink">
                  <div className="flex flex-wrap items-center gap-2">
                    <DataKindBadge kind={source.kind} />
                    <DemoTag />
                    <Pill tone={source.status === 'activa' ? 'forest' : source.status === 'pausada' ? 'neutral' : 'warning'}>
                      {sourceStatusLabels[source.status]}
                    </Pill>
                  </div>
                  <h3 className="mt-3 text-[1.25rem]">{source.name}</h3>
                  <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted">Tipo</dt>
                      <dd>{source.type}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Responsable</dt>
                      <dd>{source.responsible}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Periodo</dt>
                      <dd>{source.period}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Fecha de corte</dt>
                      <dd>{formatDate(source.cutoffDate)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Actualización</dt>
                      <dd>{source.updateFrequency}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">Módulo</dt>
                      <dd>{source.module === 'A' ? 'A · Información pública' : 'B · Participación y reportes'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted">Cobertura</dt>
                      <dd>{source.coverage}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-muted">Limitaciones</dt>
                      <dd>{source.limitations}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </AsyncContent>
      </section>
    </>
  );
}
