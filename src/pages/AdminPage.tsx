import { ClipboardCheck, Database, History, Lock, ShieldCheck, SplitSquareHorizontal } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useSession } from '../app/session';
import { ReportStatusPill, StatusTimeline } from '../components/reports/ReportStatus';
import { DataKindBadge, DemoTag, Pill } from '../components/ui/Badges';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { InputField, RadioCards, SelectField, TextAreaField } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { PageHeader, SectionHeading } from '../components/ui/PageHeader';
import { AsyncContent, EmptyState, LoadingState } from '../components/ui/States';
import { MIN_PUBLIC_COUNT, REPORT_COMMENT_MAX } from '../config/demo';
import { roleAliases, roleLabels } from '../config/roles';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { regionName, regions } from '../mocks/regions';
import {
  channelLabels,
  discardReasons,
  peopleRangeLabels,
  reportCategoryLabels,
  reportStatusLabels,
  reportStatusOrder,
  responsibleByCategory,
  responsibleOptions,
  symptomLabels,
} from '../mocks/reports';
import { getAuditLog } from '../services/auditService';
import { ValidationError } from '../services/client';
import { allowedActions, moderationActionLabels, type ModerationActionId } from '../services/moderation';
import { getModerationQueue, moderateReport, type ModerationFilters } from '../services/reportService';
import { getDataSources, setDataSourceStatus, sourceStatusLabels } from '../services/sourceService';
import type { AuditEntityType, CitizenReport, DataSource, DataSourceStatus, ModerationDecision, ReportCategory } from '../types';
import { formatDate, formatDateTime } from '../utils/dates';

const SECTIONS = [
  { id: 'fuentes', label: 'Fuentes de datos', icon: Database },
  { id: 'moderacion', label: 'Moderación', icon: ClipboardCheck },
  { id: 'bitacora', label: 'Bitácora', icon: History },
  { id: 'modulos', label: 'Separación de módulos', icon: SplitSquareHorizontal },
] as const;

function useActor() {
  const { session } = useSession();
  return { role: session?.role ?? 'admin', label: session?.alias ?? roleAliases.admin } as const;
}

/* ---------- Fuentes de datos ---------- */

function SourcesSection() {
  const actor = useActor();
  const { resource, data, reload, mutate } = useAsync(getDataSources, []);
  const [editing, setEditing] = useState<DataSource | null>(null);
  const [status, setStatus] = useState<DataSourceStatus>('activa');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const open = (source: DataSource) => {
    setEditing(source);
    setStatus(source.status);
    setReason('');
    setError(undefined);
  };

  const save = async () => {
    if (!editing || !data) return;
    setSaving(true);
    setError(undefined);
    try {
      const updated = await setDataSourceStatus(editing.id, status, reason, actor);
      mutate(data.map((source) => (source.id === updated.id ? updated : source)));
      setMessage(`«${updated.name}» quedó como ${sourceStatusLabels[updated.status].toLowerCase()}. El cambio se registró en la bitácora.`);
      setEditing(null);
    } catch (cause) {
      setError(cause instanceof ValidationError ? cause.fieldErrors.reason : cause instanceof Error ? cause.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="fuentes" aria-labelledby="fuentes-titulo" className="scroll-mt-24">
      <SectionHeading
        id="fuentes-titulo"
        title="Fuentes de datos"
        description="Gestión simulada: cambiar el estado se registra en la bitácora y se refleja en «Normativa y fuentes»."
      />
      {message && (
        <Notice tone="tip" className="mb-4" role="status">
          {message}
        </Notice>
      )}
      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={3} />}>
        {(sources) => (
          <div className="relative overflow-x-auto rounded-card border border-border-mist" tabIndex={0} aria-label="Tabla de fuentes, desplazable">
            <table className="table-base min-w-[60rem]">
              <caption className="sr-only">Fuentes de datos DEMO con tipo, responsable, periodo, fecha de corte y estado</caption>
              <thead>
                <tr>
                  <th scope="col">Fuente</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Responsable</th>
                  <th scope="col">Periodo</th>
                  <th scope="col">Corte</th>
                  <th scope="col">Estado</th>
                  <th scope="col">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id}>
                    <th scope="row" className="font-medium">
                      {source.name}
                      <span className="block text-xs font-normal text-muted">Módulo {source.module}</span>
                    </th>
                    <td>
                      <DataKindBadge kind={source.kind} compact />
                    </td>
                    <td>{source.responsible}</td>
                    <td className="text-muted">{source.period}</td>
                    <td className="whitespace-nowrap">{formatDate(source.cutoffDate)}</td>
                    <td>
                      <Pill tone={source.status === 'activa' ? 'forest' : source.status === 'pausada' ? 'neutral' : 'warning'}>
                        {sourceStatusLabels[source.status]}
                      </Pill>
                    </td>
                    <td>
                      <Button size="sm" variant="secondary" onClick={() => open(source)}>
                        Cambiar estado<span className="sr-only"> de {source.name}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AsyncContent>

      <Dialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Cambiar estado de la fuente"
        description={editing?.name}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button loading={saving} onClick={save}>
              Guardar y registrar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <SelectField label="Nuevo estado" value={status} onChange={(event) => setStatus(event.target.value as DataSourceStatus)}>
            {(Object.keys(sourceStatusLabels) as DataSourceStatus[]).map((option) => (
              <option key={option} value={option}>
                {sourceStatusLabels[option]}
              </option>
            ))}
          </SelectField>
          <TextAreaField
            label="Motivo"
            hint="Queda en la bitácora. Sin datos personales."
            value={reason}
            error={error}
            onChange={(event) => setReason(event.target.value)}
            counter={{ current: reason.length, max: REPORT_COMMENT_MAX }}
          />
        </div>
      </Dialog>
    </section>
  );
}

/* ---------- Moderación ---------- */

interface DialogState {
  report: CitizenReport;
  action: ModerationActionId;
}

function ModerationDialog({
  state,
  onClose,
  onDone,
}: {
  state: DialogState | null;
  onClose: () => void;
  onDone: (report: CitizenReport) => void;
}) {
  const actor = useActor();
  const [reason, setReason] = useState('');
  const [discardReason, setDiscardReason] = useState<string>(discardReasons[0]);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [outcome, setOutcome] = useState<'atendido-por-autoridad' | 'sin-accion-documentada'>('atendido-por-autoridad');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);

  // Reinicia el formulario cuando se abre para otro reporte o acción.
  const key = state ? `${state.report.id}:${state.action}` : null;
  if (key !== lastKey) {
    setLastKey(key);
    setReason('');
    setDiscardReason(discardReasons[0]);
    setAssignedTo(state ? responsibleByCategory[state.report.category] : '');
    setOutcome('atendido-por-autoridad');
    setErrors({});
  }

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!state) return;
    let decision: ModerationDecision;
    switch (state.action) {
      case 'descartar':
        decision = { action: 'descartar', reason, discardReason };
        break;
      case 'canalizar':
        decision = { action: 'canalizar', reason, assignedTo };
        break;
      case 'cerrar':
        decision = { action: 'cerrar', reason, outcome };
        break;
      default:
        decision = { action: state.action, reason };
    }
    setSaving(true);
    setErrors({});
    try {
      onDone(await moderateReport(state.report.id, decision, actor));
    } catch (cause) {
      setErrors(cause instanceof ValidationError ? cause.fieldErrors : { reason: cause instanceof Error ? cause.message : 'No se pudo registrar.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={state !== null}
      onClose={onClose}
      title={state ? moderationActionLabels[state.action] : ''}
      description={state ? `Reporte ${state.report.folio} · ${reportCategoryLabels[state.report.category]} · ${regionName(state.report.approximateZone)}` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={saving} onClick={() => submit()}>
            Registrar decisión
          </Button>
        </>
      }
    >
      {state && (
        <form className="space-y-4" onSubmit={submit} noValidate>
          {state.action === 'aprobar' && (
            <Notice tone="integrity">Aprobar significa «revisado como observación útil». No confirma un caso ni un riesgo.</Notice>
          )}
          {state.action === 'descartar' && (
            <SelectField label="Motivo de descarte" value={discardReason} error={errors.discardReason} onChange={(event) => setDiscardReason(event.target.value)}>
              {discardReasons.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SelectField>
          )}
          {state.action === 'canalizar' && (
            <>
              <SelectField label="Instancia responsable" value={assignedTo} error={errors.assignedTo} onChange={(event) => setAssignedTo(event.target.value)}>
                {responsibleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectField>
              <Notice tone="info">Canalizar comparte la observación de forma agregada. No obliga a la instancia a actuar.</Notice>
            </>
          )}
          {state.action === 'cerrar' && (
            <RadioCards
              name="resultado"
              legend="Resultado documentado"
              columns={1}
              value={outcome}
              onChange={setOutcome}
              options={[
                { value: 'atendido-por-autoridad', label: 'La instancia documentó una atención' },
                { value: 'sin-accion-documentada', label: 'Sin acción documentada por la instancia' },
              ]}
            />
          )}
          <TextAreaField
            label="Motivo (se registra en la bitácora)"
            hint="Obligatorio. Sin datos personales."
            value={reason}
            error={errors.reason}
            onChange={(event) => setReason(event.target.value)}
            counter={{ current: reason.length, max: REPORT_COMMENT_MAX }}
          />
        </form>
      )}
    </Dialog>
  );
}

const PAGE_SIZE = 8;

function ModerationSection({ onModerated }: { onModerated: () => void }) {
  const [filters, setFilters] = useState<ModerationFilters>({ status: 'activos', regionId: 'todas', category: 'todas', folio: '' });
  const { resource, reload } = useAsync(() => getModerationQueue(filters), [filters]);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section id="moderacion" aria-labelledby="moderacion-titulo" className="scroll-mt-24">
      <SectionHeading
        id="moderacion-titulo"
        title="Moderación de reportes"
        description="Cada decisión exige un motivo y queda en la bitácora. En la DEMO, los reportes propios de este navegador también aparecen aquí."
      />
      <form className="mb-4 grid grid-cols-1 gap-3 rounded-card bg-border-mist/60 p-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Filtros de moderación" onSubmit={(event) => event.preventDefault()}>
        <InputField
          label="Folio"
          type="search"
          placeholder="OND-…"
          value={filters.folio ?? ''}
          onChange={(event) => {
            setVisibleCount(PAGE_SIZE);
            setFilters((current) => ({ ...current, folio: event.target.value }));
          }}
        />
        <SelectField
          label="Estado"
          value={filters.status}
          onChange={(event) => {
            setVisibleCount(PAGE_SIZE);
            setFilters((current) => ({ ...current, status: event.target.value as ModerationFilters['status'] }));
          }}
        >
          <option value="activos">Activos (sin cerrar)</option>
          {reportStatusOrder.map((status) => (
            <option key={status} value={status}>
              {reportStatusLabels[status]}
            </option>
          ))}
          <option value="todos">Todos</option>
        </SelectField>
        <SelectField
          label="Zona"
          value={filters.regionId}
          onChange={(event) => {
            setVisibleCount(PAGE_SIZE);
            setFilters((current) => ({ ...current, regionId: event.target.value }));
          }}
        >
          <option value="todas">Todas</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Categoría"
          value={filters.category}
          onChange={(event) => {
            setVisibleCount(PAGE_SIZE);
            setFilters((current) => ({ ...current, category: event.target.value as ReportCategory | 'todas' }));
          }}
        >
          <option value="todas">Todas</option>
          {(Object.keys(reportCategoryLabels) as ReportCategory[]).map((category) => (
            <option key={category} value={category}>
              {reportCategoryLabels[category]}
            </option>
          ))}
        </SelectField>
      </form>
      {message && (
        <Notice tone="tip" className="mb-4" role="status">
          {message}
        </Notice>
      )}
      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={3} />}>
        {(reports) =>
          reports.length === 0 ? (
            <EmptyState title="Sin reportes en esta vista" description="No hay reportes con estos filtros. Prueba con «Todos»." />
          ) : (
            <>
              <p className="mb-3 text-sm text-muted" aria-live="polite">
                Mostrando {Math.min(visibleCount, reports.length)} de {reports.length} reportes (los más antiguos primero).
              </p>
              <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {reports.slice(0, visibleCount).map((report) => {
                  const actions = allowedActions(report);
                  return (
                    <li key={report.id}>
                      <article className="card card-cream h-full" aria-labelledby={`mod-${report.id}`}>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 id={`mod-${report.id}`} className="font-mono text-[1.0625rem] font-semibold tracking-wide text-forest-ink">
                              {report.folio}
                            </h3>
                            <p className="text-sm text-muted">{formatDateTime(report.createdAt)}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <ReportStatusPill status={report.status} />
                            {report.awaitingMoreInfo && <Pill tone="plum">Esperando ampliación</Pill>}
                            {report.origin === 'propio' && <Pill tone="blue">De este navegador</Pill>}
                          </div>
                        </div>
                        <p className="mt-3 text-sm">
                          {reportCategoryLabels[report.category]} · {regionName(report.approximateZone)} · {channelLabels[report.channel]}
                        </p>
                        {report.symptoms && (
                          <p className="mt-1 text-sm text-muted">
                            {report.symptoms.symptoms.map((symptom) => symptomLabels[symptom]).join(', ')} · {peopleRangeLabels[report.symptoms.peopleRange]}
                          </p>
                        )}
                        {report.comment && <p className="mt-2 leading-relaxed">«{report.comment}»</p>}
                        {report.additionalInfo && <p className="mt-1 text-sm">Ampliación: «{report.additionalInfo}»</p>}
                        {report.assignedTo && <p className="mt-1 text-sm text-muted">Responsable: {report.assignedTo}</p>}
                        {actions.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {actions.map((action) => (
                              <Button
                                key={action}
                                size="sm"
                                variant={action === 'descartar' ? 'danger' : action === 'aprobar' || action === 'canalizar' ? 'primary' : 'secondary'}
                                onClick={() => setDialog({ report, action })}
                              >
                                {moderationActionLabels[action]}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-muted">Seguimiento cerrado: sin acciones disponibles.</p>
                        )}
                        <details className="mt-3 text-sm">
                          <summary className="cursor-pointer py-1 text-forest-ink">Historial ({report.history.length})</summary>
                          <div className="mt-3">
                            <StatusTimeline history={report.history} />
                          </div>
                        </details>
                      </article>
                    </li>
                  );
                })}
              </ul>
              {visibleCount < reports.length && (
                <div className="mt-4 flex justify-center">
                  <Button variant="secondary" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                    Mostrar más
                  </Button>
                </div>
              )}
            </>
          )
        }
      </AsyncContent>
      <ModerationDialog
        state={dialog}
        onClose={() => setDialog(null)}
        onDone={(report) => {
          setDialog(null);
          setMessage(`Decisión registrada: ${report.folio} ahora está «${reportStatusLabels[report.status]}».`);
          reload();
          onModerated();
        }}
      />
    </section>
  );
}

/* ---------- Bitácora ---------- */

const ENTITY_LABELS: Record<AuditEntityType, string> = {
  reporte: 'Reporte',
  fuente: 'Fuente',
  sesion: 'Sesión',
  exportacion: 'Exportación',
};

function AuditSection({ refreshKey }: { refreshKey: number }) {
  const [entity, setEntity] = useState<AuditEntityType | 'todas'>('todas');
  const { resource, reload } = useAsync(() => getAuditLog(entity), [entity, refreshKey]);
  const [visibleCount, setVisibleCount] = useState(15);
  return (
    <section id="bitacora" aria-labelledby="bitacora-titulo" className="scroll-mt-24">
      <SectionHeading
        id="bitacora-titulo"
        title="Bitácora"
        description="Quién (rol), qué, cuándo y sobre qué entidad. Sin datos personales; la actividad de la ciudadanía no se registra."
      />
      <div className="mb-4 max-w-xs">
        <SelectField label="Entidad" value={entity} onChange={(event) => setEntity(event.target.value as AuditEntityType | 'todas')}>
          <option value="todas">Todas</option>
          {(Object.keys(ENTITY_LABELS) as AuditEntityType[]).map((option) => (
            <option key={option} value={option}>
              {ENTITY_LABELS[option]}
            </option>
          ))}
        </SelectField>
      </div>
      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={3} />}>
        {(entries) => (
          <>
            <div className="relative overflow-x-auto rounded-card border border-border-mist" tabIndex={0} aria-label="Tabla de bitácora, desplazable">
              <table className="table-base min-w-[52rem]">
                <caption className="sr-only">Bitácora de acciones simuladas, de la más reciente a la más antigua</caption>
                <thead>
                  <tr>
                    <th scope="col">Cuándo</th>
                    <th scope="col">Quién</th>
                    <th scope="col">Qué</th>
                    <th scope="col">Entidad</th>
                    <th scope="col">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(0, visibleCount).map((entry) => (
                    <tr key={entry.id}>
                      <td className="whitespace-nowrap tabular-nums">{formatDateTime(entry.at)}</td>
                      <td>
                        {entry.actorRole === 'sistema' ? 'Sistema' : roleLabels[entry.actorRole]}
                        <span className="block text-xs text-muted">{entry.actorLabel}</span>
                      </td>
                      <td>{entry.action}</td>
                      <td className="whitespace-nowrap">
                        {ENTITY_LABELS[entry.entityType]} <span className="font-mono text-xs text-muted">{entry.entityId}</span>
                      </td>
                      <td className="text-muted">{entry.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visibleCount < entries.length && (
              <div className="mt-4 flex justify-center">
                <Button variant="secondary" onClick={() => setVisibleCount((count) => count + 15)}>
                  Mostrar más entradas
                </Button>
              </div>
            )}
          </>
        )}
      </AsyncContent>
    </section>
  );
}

/* ---------- Separación de módulos ---------- */

function ModulesSection() {
  return (
    <section id="modulos" aria-labelledby="modulos-titulo" className="scroll-mt-24">
      <SectionHeading
        id="modulos-titulo"
        title="Separación de módulos"
        description="Configuración visible (solo lectura en la DEMO). Las reglas de retención están pendientes de validar con la autoridad."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card card-keylime">
          <p className="eyebrow">Módulo A</p>
          <h3 className="mt-1 text-[1.5rem]">Información pública</h3>
          <dl className="mt-4 space-y-3 text-[0.9375rem]">
            <div>
              <dt className="font-semibold">Contenido</dt>
              <dd>Mapa, enfermedades y señales, brigadas, directorio y normativa.</dd>
            </div>
            <div>
              <dt className="font-semibold">Datos</dt>
              <dd>Solo agregados por zona y datos simulados. No contiene datos personales.</dd>
            </div>
            <div>
              <dt className="font-semibold">Retención</dt>
              <dd>Las series se conservan durante el piloto y siempre se publican con fecha de corte.</dd>
            </div>
            <div>
              <dt className="font-semibold">Entrada desde el módulo B</dt>
              <dd>Solo conteos agregados, con supresión de valores menores a {MIN_PUBLIC_COUNT}.</dd>
            </div>
          </dl>
        </div>
        <div className="card card-slate">
          <p className="eyebrow">Módulo B</p>
          <h3 className="mt-1 text-[1.5rem]">Participación y reportes</h3>
          <dl className="mt-4 space-y-3 text-[0.9375rem]">
            <div>
              <dt className="font-semibold">Contenido</dt>
              <dd>Reportes ciudadanos, seguimiento, moderación y canalización.</dd>
            </div>
            <div>
              <dt className="font-semibold">Datos</dt>
              <dd>Categoría, zona amplia, comentario sin datos personales y estado. Sin nombre, teléfono, correo, domicilio ni coordenadas.</dd>
            </div>
            <div>
              <dt className="font-semibold">Retención (por validar)</dt>
              <dd>Los textos libres se eliminan 90 días después del cierre y se conserva solo el conteo agregado. Las fotos no se almacenan en la DEMO.</dd>
            </div>
            <div>
              <dt className="font-semibold">Eliminación</dt>
              <dd>La ciudadanía puede eliminar sus reportes desde «Mis reportes». Al cierre del piloto se aplican las reglas acordadas.</dd>
            </div>
          </dl>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Lock, text: 'Los módulos no comparten identificadores.' },
          { icon: ShieldCheck, text: 'Los reportes no se vinculan con la identidad de quien los envía.' },
          { icon: History, text: 'La bitácora registra acciones institucionales, nunca a la ciudadanía.' },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3 rounded-card border border-border-mist p-4 text-[0.9375rem]">
            <Icon className="mt-0.5 size-5 shrink-0 text-forest-ink" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AdminPage() {
  useDocumentTitle('Gestión de reportes');
  const [auditKey, setAuditKey] = useState(0);
  return (
    <>
      <PageHeader
        eyebrow="Administrador del sector salud · DEMO"
        title="Gestión y validación de reportes"
        description="Fuentes de datos, moderación, bitácora y separación de módulos. Todas las acciones son simuladas."
        meta={<DemoTag />}
      />
      <nav aria-label="Secciones de administración" className="mb-10">
        <ul className="flex flex-wrap gap-2">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <a href={`#${id}`} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-keylime-wash px-4 text-sm font-medium text-forest-ink hover:bg-mint-veil">
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-16">
        <SourcesSection />
        <ModerationSection onModerated={() => setAuditKey((key) => key + 1)} />
        <AuditSection refreshKey={auditKey} />
        <ModulesSection />
      </div>
    </>
  );
}
