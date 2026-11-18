import {
  ArrowDown,
  Building2,
  ClipboardCheck,
  Handshake,
  Inbox,
  Layers,
  QrCode,
  Send,
  ShieldCheck,
  Smartphone,
  Tags,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Fragment } from 'react';
import { DataKindBadge } from '../components/ui/Badges';
import { ButtonLink } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';
import { PageHeader, SectionHeading } from '../components/ui/PageHeader';
import { DATA_KIND_META } from '../config/dataKinds';
import { MIN_PUBLIC_COUNT } from '../config/demo';
import { TEXTS } from '../config/texts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { pilotStages } from '../mocks/pilot';
import type { DataKind } from '../types';

interface Stage {
  name: string;
  who: string;
  icon: LucideIcon;
  what: string;
  limit: string;
}

const STAGES: Stage[] = [
  {
    name: 'Captación',
    who: 'Ciudadanía y aliados comunitarios',
    icon: Inbox,
    what: 'Se recibe una observación breve por sitio móvil, código QR o un aliado comunitario. Sin descarga, sin cuenta y sin datos personales.',
    limit: 'Recibir un reporte no significa confirmarlo.',
  },
  {
    name: 'Clasificación',
    who: 'Equipo Ondara, con reglas publicadas',
    icon: Tags,
    what: 'Se asigna la categoría y la zona aproximada, y se buscan posibles duplicados.',
    limit: 'La clasificación ordena la información; no la interpreta clínicamente.',
  },
  {
    name: 'Validación',
    who: 'Moderación Ondara',
    icon: ClipboardCheck,
    what: 'Se revisa que la observación esté completa, sea pertinente y no esté duplicada. Si falta información, se pide una ampliación.',
    limit: '«Verificado» significa revisado como observación útil, no caso confirmado.',
  },
  {
    name: 'Canalización',
    who: 'Ondara, hacia la instancia que la autoridad designe',
    icon: Send,
    what: 'Las observaciones útiles se comparten de forma agregada con la instancia responsable.',
    limit: 'Canalizar no obliga a la autoridad a actuar.',
  },
  {
    name: 'Actuación',
    who: 'Autoridad competente (sanitaria, municipal o de protección civil)',
    icon: Building2,
    what: 'La autoridad decide si actúa y cómo, según sus atribuciones y prioridades.',
    limit: 'Ondara no actúa ni promete actuaciones que la autoridad no haya aceptado.',
  },
  {
    name: 'Seguimiento',
    who: 'Ondara y la instancia responsable',
    icon: Layers,
    what: 'Se registra cada cambio de estado y el cierre documentado. La ciudadanía consulta su folio en «Mis reportes».',
    limit: 'Un cierre documentado no implica que se haya resuelto un problema de salud.',
  },
];

const CHANNELS: Array<{ name: string; icon: LucideIcon; text: string }> = [
  {
    name: 'Sitio móvil',
    icon: Smartphone,
    text: 'Funciona en el navegador del teléfono, sin descargar una aplicación ni crear una cuenta para las funciones públicas.',
  },
  {
    name: 'Códigos QR',
    icon: QrCode,
    text: 'Colocados en espacios públicos de las zonas piloto; abren directamente el formulario de reporte de esa zona.',
  },
  {
    name: 'Aliados comunitarios',
    icon: Handshake,
    text: 'Organizaciones vecinales capacitadas que ayudan a reportar, sin recopilar datos personales.',
  },
];

const KINDS: DataKind[] = ['oficial-demo', 'estimado', 'reporte-ciudadano', 'simulado'];

export function HowItWorksPage() {
  useDocumentTitle('Cómo funciona');
  return (
    <>
      <PageHeader
        eyebrow="Flujo operativo"
        title="Cómo funciona Ondara"
        description="Seis etapas, de la observación ciudadana al seguimiento. Cada una indica quién la realiza y qué no se promete."
      />

      <Notice tone="integrity" title="Regla de integridad" className="mb-10">
        {TEXTS.integrityRule}
      </Notice>

      <section aria-labelledby="etapas">
        <h2 id="etapas" className="sr-only">
          Las seis etapas
        </h2>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {STAGES.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <Fragment key={stage.name}>
                <li className="card card-keylime relative flex flex-col">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-forest-ink font-semibold text-cream-paper"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-[1.5rem]">
                      <span className="sr-only">Etapa {index + 1}: </span>
                      {stage.name}
                    </h3>
                    <Icon className="ml-auto size-6 text-forest-ink" aria-hidden="true" />
                  </div>
                  <p className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-cream-paper px-3 py-1 text-sm font-medium text-forest-ink">
                    <Users className="size-4" aria-hidden="true" />
                    <span className="sr-only">Quién la realiza: </span>
                    {stage.who}
                  </p>
                  <p className="mt-3 flex-1 leading-relaxed">{stage.what}</p>
                  <p className="mt-4 border-t border-forest-ink/15 pt-3 text-sm text-muted">{stage.limit}</p>
                </li>
                {index < STAGES.length - 1 && (
                  <li aria-hidden="true" className="flex justify-center md:hidden">
                    <ArrowDown className="size-5 text-leaf" />
                  </li>
                )}
              </Fragment>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="canales" className="mt-16">
        <SectionHeading
          id="canales"
          title="Canales de entrada"
          description="Todos llevan al mismo formulario breve. Ninguno pide nombre, teléfono, correo ni domicilio."
        />
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <li key={channel.name} className="card card-cream">
                <Icon className="size-6 text-forest-ink" aria-hidden="true" />
                <h3 className="mt-3 text-[1.25rem]">{channel.name}</h3>
                <p className="mt-2 leading-relaxed text-muted">{channel.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="tipos" className="mt-16">
        <SectionHeading
          id="tipos"
          title="Cuatro tipos de dato, siempre distinguibles"
          description="Cada dato muestra su tipo con color, icono y texto. Nunca se mezclan datos oficiales DEMO con reportes ciudadanos en un mismo símbolo."
        />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {KINDS.map((kind) => (
            <li key={kind} className="flex flex-col gap-2 rounded-card border border-border-mist p-5">
              <DataKindBadge kind={kind} className="self-start" />
              <p className="leading-relaxed text-muted">{DATA_KIND_META[kind].description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="modelo" className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card card-sage">
          <h2 id="modelo" className="text-[1.75rem]">
            Modelo de servicio
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed">
            <li>No se cobra a la ciudadanía por reportar ni por consultar información.</li>
            <li>No hay comisiones por pacientes ni por referencias médicas.</li>
            <li>Los aliados comunitarios utilizan el portal ciudadano para facilitar observaciones sin acceder a datos personales.</li>
            <li>Esta DEMO no presupone ningún subsidio ni adjudicación.</li>
          </ul>
        </div>
        <div className="card card-slate">
          <h2 className="text-[1.75rem]">Privacidad por diseño</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed">
            <li>Solo se publican agregados por zonas amplias; nunca domicilios ni puntos individuales.</li>
            <li>Los conteos ciudadanos menores a {MIN_PUBLIC_COUNT} se muestran como «&lt;{MIN_PUBLIC_COUNT}».</li>
            <li>La información pública y los reportes ciudadanos se guardan por separado.</li>
            <li>Los reportes no se vinculan con la identidad de quien los envía.</li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="piloto" className="mt-16">
        <SectionHeading
          id="piloto"
          title="Piloto de 90 días"
          description="Antes de crecer, el servicio se prueba en zonas acotadas y se evalúa con métricas de utilidad, oportunidad, seguimiento, cobertura y sostenibilidad."
        />
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pilotStages.map((stage) => (
            <li key={stage.id} className="rounded-card border border-border-mist p-5">
              <p className="text-sm text-muted">
                Días {stage.startDay}–{stage.endDay}
              </p>
              <h3 className="mt-1 text-[1.25rem]">{stage.name}</h3>
              <p className="mt-2 leading-relaxed">{stage.objective}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink to="/reportar" icon={ShieldCheck}>
            Enviar un reporte
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
