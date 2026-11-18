import { ArrowDown, ArrowRight, Filter, Inbox, ListChecks, QrCode, Route, Send, Smartphone, Users, Wrench, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Notice } from '../components/ui/Feedback';
import { PageHeader, Section } from '../components/ui/Layout';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { reportStatusInfo, reportStatusOrder } from '../mocks/reports';
import { ReportStatusPill } from '../components/ui/Badges';

interface Stage {
  name: string;
  who: string;
  what: string;
  icon: LucideIcon;
}

/** Flujo operativo de seis etapas (documento conceptual). */
const STAGES: Stage[] = [
  {
    name: 'Captación',
    who: 'Ciudadanía y aliados comunitarios',
    what: 'Se envía una observación breve por zona aproximada, sin datos personales ni domicilio.',
    icon: Inbox,
  },
  {
    name: 'Clasificación',
    who: 'Plataforma Ondara (reglas transparentes)',
    what: 'El reporte se ordena por categoría, zona y periodo, y se detectan posibles duplicados.',
    icon: Filter,
  },
  {
    name: 'Validación',
    who: 'Mesa de revisión Ondara',
    what: 'Se revisa si está completo, es pertinente y no duplicado. "Verificado" significa observación útil, no caso confirmado.',
    icon: ListChecks,
  },
  {
    name: 'Canalización',
    who: 'Mesa de revisión hacia el área responsable',
    what: 'La observación útil se envía al área competente con contexto agregado.',
    icon: Send,
  },
  {
    name: 'Actuación',
    who: 'Autoridad sanitaria o área responsable',
    what: 'La autoridad decide si actúa y cómo. Ondara no promete ni ejecuta acciones sanitarias.',
    icon: Wrench,
  },
  {
    name: 'Seguimiento',
    who: 'Área responsable y mesa de revisión',
    what: 'Se documenta responsable, cierre y motivo, y se informa el estado a quien reportó mediante su folio.',
    icon: Route,
  },
];

const CHANNELS: Array<{ name: string; text: string; icon: LucideIcon }> = [
  { name: 'Sitio móvil', text: 'Sin descarga ni cuenta para funciones públicas. Funciona en cualquier navegador.', icon: Smartphone },
  { name: 'Códigos QR', text: 'En espacios públicos y escuelas participantes, llevan directo al formulario de reporte.', icon: QrCode },
  {
    name: 'Aliados comunitarios',
    text: 'Personas y organizaciones capacitadas que ayudan a capturar observaciones sin registrar datos personales.',
    icon: Users,
  },
];

export default function HowItWorks() {
  useDocumentTitle('Cómo funciona');
  return (
    <>
      <PageHeader
        eyebrow="Flujo operativo"
        title="Cómo funciona Ondara"
        description="De una observación ciudadana a un seguimiento documentado, en seis etapas. Cada una indica quién la realiza."
        demo={false}
      />

      <div className="panel-sage">
        <p className="eyebrow mb-2">Regla de integridad</p>
        <p className="title-display text-[30px] md:text-[40px]">Un reporte ciudadano es una observación, no un caso clínico confirmado.</p>
        <p className="mt-3 max-w-2xl text-[15px] text-ink">
          Ondara complementa la vigilancia oficial. La confirmación de casos y brotes, y las alertas oficiales, corresponden
          exclusivamente a la autoridad sanitaria.
        </p>
      </div>

      <Section id="etapas" eyebrow="Seis etapas" title="Captación → Clasificación → Validación → Canalización → Actuación → Seguimiento">
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {STAGES.map((stage, i) => (
            <li key={stage.name} className="card relative flex flex-col">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-keylime font-semibold text-forest" aria-hidden>
                  {i + 1}
                </span>
                <h3 className="title-display text-[28px]">
                  <span className="sr-only">Etapa {i + 1}: </span>
                  {stage.name}
                </h3>
                <stage.icon aria-hidden className="ml-auto h-5 w-5 text-forest" />
              </div>
              <p className="mt-4 text-[14px]">
                <span className="font-semibold">Quién: </span>
                <span className="text-muted">{stage.who}</span>
              </p>
              <p className="mt-2 text-[15px]">{stage.what}</p>
              {i < STAGES.length - 1 && (
                <ArrowDown aria-hidden className="absolute -bottom-3 left-1/2 hidden h-5 w-5 -translate-x-1/2 rounded-full bg-cream text-muted max-md:block" />
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="estados"
        eyebrow="Seguimiento por folio"
        title="Qué significa cada estado de un reporte"
        description="Quien reporta recibe un folio y puede consultar el estado. Ningún estado implica una acción garantizada de la autoridad."
      >
        <ul className="divide-y divide-hairline rounded-[14px] border border-hairline">
          {reportStatusOrder.map((status) => (
            <li key={status} className="grid gap-2 p-4 sm:grid-cols-[180px_1fr] sm:items-center">
              <div>
                <ReportStatusPill status={status} />
              </div>
              <p className="text-[15px]">{reportStatusInfo[status].meaning}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="canales" eyebrow="Canales de entrada" title="Cómo llegan los reportes">
        <ul className="grid gap-3 md:grid-cols-3">
          {CHANNELS.map((c) => (
            <li key={c.name} className="panel-keylime">
              <c.icon aria-hidden className="mb-3 h-6 w-6 text-forest" />
              <p className="font-semibold text-forest">{c.name}</p>
              <p className="mt-1 text-[15px]">{c.text}</p>
            </li>
          ))}
        </ul>
        <Notice tone="caution" className="mt-4" title="Sin canales que expongan identidad">
          No se usa WhatsApp ni otros canales que revelen el número telefónico como si fueran anónimos. Los reportes no piden
          nombre, teléfono, correo ni domicilio.
        </Notice>
      </Section>

      <Section id="modelo" eyebrow="Modelo de servicio" title="Sin cobros a la ciudadanía">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="card">
            <p className="font-semibold text-forest">Lo que no existe en Ondara</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
              <li>Cobros a ciudadanos por reportar o consultar.</li>
              <li>Intermediación de consultas o servicios de atención clínica.</li>
              <li>Subsidios o adjudicaciones presupuestas.</li>
            </ul>
          </div>
          <div className="card">
            <p className="font-semibold text-forest">Cómo se evalúa</p>
            <p className="mt-2 text-[15px]">
              Un piloto de 90 días mide utilidad, oportunidad, seguimiento, cobertura y sostenibilidad. Ninguna métrica se interpreta
              como efecto clínico ni como reducción de enfermedades atribuible a la plataforma.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/reportes" className="btn btn-primary">
            Enviar un reporte
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
          <Link to="/normativa" className="btn btn-ghost">
            Ver privacidad y normativa
          </Link>
        </div>
      </Section>
    </>
  );
}
