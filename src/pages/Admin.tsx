import { Database, FileClock, Gavel, Settings2, type LucideIcon } from 'lucide-react';
import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { roleLabels } from '../app/access';
import { useSession } from '../app/SessionContext';
import { DataKindBadge, ReportStatusPill } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { Field } from '../components/ui/Form';
import { PageHeader } from '../components/ui/Layout';
import { isTestMode, setTestMode } from '../config/demo';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { regionName } from '../mocks/regions';
import { reportCategoryLabels, reportChannelLabels, reportStatusInfo } from '../mocks/reports';
import { auditActionLabels, getAuditLog, recordAudit } from '../services/auditService';
import { getDataSources, updateDataSource } from '../services/institutionalService';
import { allowedActions, getModerationQueue, moderateReport, type ModerationAction } from '../services/reportService';
import type { CitizenReport, DataSource, DataSourceStatus, DataSourceType, ReportStatus } from '../types';
import { formatDate, formatDateTime } from '../utils/dates';

type TabId = 'fuentes' | 'moderacion' | 'bitacora' | 'configuracion';
const TABS: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: 'fuentes', label: 'Fuentes de datos', icon: Database },
  { id: 'moderacion', label: 'Moderación', icon: Gavel },
  { id: 'bitacora', label: 'Bitácora', icon: FileClock },
  { id: 'configuracion', label: 'Configuración', icon: Settings2 },
];

const sourceTypeLabels: Record<DataSourceType, string> = {
  'oficial-demo': 'Oficial DEMO',
  estimado: 'Estimado',
  ciudadano: 'Ciudadano',
  'entomologico-demo': 'Entomológico DEMO',
  'campanas-demo': 'Campañas DEMO',
  'directorio-demo': 'Directorio DEMO',
};
const sourceStatusLabels: Record<DataSourceStatus, string> = { activa: 'Activa', pausada: 'Pausada', en_validacion: 'En validación' };

export default function Admin() {
  useDocumentTitle('Administración');
  const [tab, setTab] = useState<TabId>('moderacion');
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = TABS[(idx + delta + TABS.length) % TABS.length]!;
    setTab(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <>
      <PageHeader
        eyebrow="Rol administración DEMO"
        title="Administración"
        description="Gestión simulada de fuentes, moderación de reportes, bitácora de acciones y reglas de separación de módulos."
      />
      <div role="tablist" aria-label="Secciones de administración" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {TABS.map((t, idx) => (
          <button
            key={t.id}
            ref={(el) => {
              tabRefs.current[t.id] = el;
            }}
            id={`${baseId}-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            aria-controls={`${baseId}-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onKeyDown(e, idx)}
            className={`btn btn-sm shrink-0 ${tab === t.id ? 'bg-forest text-cream' : 'bg-paper text-ink hover:bg-keylime'}`}
          >
            <t.icon aria-hidden className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${baseId}-panel-${tab}`} aria-labelledby={`${baseId}-tab-${tab}`} className="mt-6">
        {tab === 'fuentes' && <SourcesPanel />}
        {tab === 'moderacion' && <ModerationPanel />}
        {tab === 'bitacora' && <AuditPanel />}
        {tab === 'configuracion' && <ConfigPanel />}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------

function SourcesPanel() {
  const { role } = useSession();
  const { data, loading, error, reload } = useAsync(getDataSources, []);
  const [editing, setEditing] = useState<string | null>(null);

  if (loading) return <LoadingState variant="list" rows={4} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <>
      <Notice tone="info" className="mb-4">
        Los cambios se guardan solo en memoria (se reinician al recargar) y quedan registrados en la bitácora.
      </Notice>
      <ul className="space-y-3">
        {data?.map((s) => (
          <li key={s.id} className="card">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="pill bg-keylime text-forest">{sourceTypeLabels[s.type]}</span>
                  <span className={`pill ${s.status === 'activa' ? 'bg-success-bg text-success' : s.status === 'pausada' ? 'bg-paper text-muted' : 'bg-caution-bg text-caution'}`}>
                    {sourceStatusLabels[s.status]} (DEMO)
                  </span>
                </div>
                <h3 className="mt-2 text-[17px] font-semibold text-forest">{s.name}</h3>
                <dl className="mt-2 grid gap-x-6 gap-y-1 text-[13.5px] sm:grid-cols-2">
                  <div>
                    <dt className="inline font-semibold">Responsable: </dt>
                    <dd className="inline text-muted">{s.responsible}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Periodo: </dt>
                    <dd className="inline text-muted">{s.period}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Fecha de corte: </dt>
                    <dd className="inline text-muted">{formatDate(s.cutoffDate)}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Cobertura: </dt>
                    <dd className="inline text-muted">{s.coverage}</dd>
                  </div>
                </dl>
              </div>
              <button type="button" className="btn btn-ghost btn-sm self-start" aria-expanded={editing === s.id} onClick={() => setEditing(editing === s.id ? null : s.id)}>
                {editing === s.id ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            {editing === s.id && (
              <SourceEditor
                source={s}
                onSaved={() => {
                  setEditing(null);
                  reload();
                }}
                save={(patch, reason) => updateDataSource(s.id, patch, reason, role)}
              />
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

function SourceEditor({
  source,
  save,
  onSaved,
}: {
  source: DataSource;
  save: (patch: { status: DataSourceStatus; cutoffDate: string }, reason: string) => Promise<DataSource>;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState(source.status);
  const [cutoffDate, setCutoffDate] = useState(source.cutoffDate);
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setErr('Registra un motivo de al menos 5 caracteres.');
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await save({ status, cutoffDate }, reason);
      onSaved();
    } catch (er) {
      setErr(er instanceof Error ? er.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  };
  const p = `fuente-${source.id}`;
  return (
    <form noValidate onSubmit={submit} className="mt-4 grid gap-4 rounded-[12px] bg-paper p-4 md:grid-cols-[180px_180px_1fr_auto] md:items-end">
      <Field id={`${p}-estado`} label="Estado">
        <select id={`${p}-estado`} className="input" value={status} onChange={(e) => setStatus(e.target.value as DataSourceStatus)}>
          {(Object.keys(sourceStatusLabels) as DataSourceStatus[]).map((st) => (
            <option key={st} value={st}>
              {sourceStatusLabels[st]}
            </option>
          ))}
        </select>
      </Field>
      <Field id={`${p}-corte`} label="Fecha de corte">
        <input id={`${p}-corte`} type="date" className="input" value={cutoffDate} onChange={(e) => setCutoffDate(e.target.value)} />
      </Field>
      <Field id={`${p}-motivo`} label="Motivo del cambio" required error={err ?? undefined}>
        <input
          id={`${p}-motivo`}
          className="input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          aria-invalid={Boolean(err)}
          aria-describedby={err ? `${p}-motivo-error` : undefined}
        />
      </Field>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------

const ACTION_LABELS: Record<ModerationAction, string> = {
  aprobar: 'Aprobar como útil',
  ampliacion: 'Pedir ampliación',
  descartar: 'Descartar',
  canalizar: 'Canalizar',
  cerrar: 'Cerrar seguimiento',
};

function ModerationPanel() {
  const { data, loading, error, reload } = useAsync(getModerationQueue, []);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'todos'>('pendiente');
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = (data ?? []).filter((r) => statusFilter === 'todos' || r.status === statusFilter);
  return (
    <>
      <Notice tone="info" className="mb-4" title="Moderación de observaciones">
        Aprobar significa «revisado como observación útil», no caso confirmado. Toda acción exige un motivo y queda en la bitácora. Los reportes no
        contienen datos personales.
      </Notice>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <Field id="mod-estado" label="Estado" className="w-full sm:w-60">
          <select id="mod-estado" className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'todos')}>
            <option value="todos">Todos los abiertos</option>
            {(['pendiente', 'en_revision', 'verificado', 'canalizado'] as ReportStatus[]).map((s) => (
              <option key={s} value={s}>
                {reportStatusInfo[s].label}
              </option>
            ))}
          </select>
        </Field>
        {data && <p className="text-[14px] text-muted">{filtered.length} reportes</p>}
      </div>
      {notice && (
        <Notice tone="success" role="status" className="mb-4">
          {notice}
        </Notice>
      )}
      {loading ? (
        <LoadingState variant="list" rows={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nada por moderar" description="No hay reportes abiertos con ese estado." />
      ) : (
        <ul className="space-y-3">
          {filtered.slice(0, 25).map((r) => (
            <li key={r.id}>
              <ModerationItem
                report={r}
                onDone={(msg) => {
                  setNotice(msg);
                  reload();
                }}
              />
            </li>
          ))}
        </ul>
      )}
      {filtered.length > 25 && <p className="mt-3 text-[13.5px] text-muted">Se muestran los 25 más recientes.</p>}
    </>
  );
}

function ModerationItem({ report: r, onDone }: { report: CitizenReport; onDone: (msg: string) => void }) {
  const { role } = useSession();
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<ModerationAction | null>(null);
  const actions = allowedActions(r.status);
  const reasonId = `motivo-${r.id}`;

  const act = async (action: ModerationAction) => {
    if (reason.trim().length < 5) {
      setErr('Registra un motivo de al menos 5 caracteres antes de elegir una acción.');
      document.getElementById(reasonId)?.focus();
      return;
    }
    setBusy(action);
    setErr(null);
    try {
      const updated = await moderateReport(r.id, action, reason, role);
      onDone(`${updated.folio}: ${ACTION_LABELS[action].toLowerCase()} → ${reportStatusInfo[updated.status].label}.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'No se pudo aplicar la acción.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <article className="card">
      <div className="flex flex-wrap items-center gap-2">
        <DataKindBadge kind="ciudadano" short />
        <ReportStatusPill status={r.status} />
        {r.isOwn && <span className="pill bg-slate-soft text-info">Creado en este navegador</span>}
      </div>
      <h3 className="mt-2 text-[16px] font-semibold text-forest">
        {r.folio} · {reportCategoryLabels[r.category]} · {regionName(r.approximateZone)}
      </h3>
      <p className="text-[13px] text-muted">
        {reportChannelLabels[r.channel]} · {formatDateTime(r.createdAt)}
      </p>
      <p className="mt-2 text-[15px]">{r.comments}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <Field id={reasonId} label="Motivo (obligatorio)" error={err ?? undefined}>
          <input
            id={reasonId}
            className="input"
            value={reason}
            placeholder="Ej. completo y pertinente; sin duplicados en la zona"
            onChange={(e) => {
              setReason(e.target.value);
              setErr(null);
            }}
            aria-invalid={Boolean(err)}
            aria-describedby={err ? `${reasonId}-error` : undefined}
          />
        </Field>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={a}
              type="button"
              disabled={busy !== null}
              onClick={() => act(a)}
              className={`btn btn-sm ${a === 'descartar' ? 'btn-danger' : a === 'aprobar' || a === 'canalizar' ? 'btn-primary' : 'btn-ghost'}`}
            >
              {busy === a ? 'Aplicando…' : ACTION_LABELS[a]}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------

function AuditPanel() {
  const { data, loading, error, reload } = useAsync(getAuditLog, []);
  if (loading) return <LoadingState variant="list" rows={4} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data?.length) return <EmptyState title="Bitácora vacía" description="Las acciones de moderación, fuentes y exportación aparecerán aquí." />;
  return (
    <>
      <p className="mb-3 text-[14px] text-muted">
        Registra quién (rol), qué, cuándo y sobre qué entidad. Sin datos personales. Se guarda en este navegador.
      </p>
      <div className="table-wrap">
        <table className="table">
          <caption className="sr-only">Bitácora de acciones simuladas</caption>
          <thead>
            <tr>
              <th scope="col">Cuándo</th>
              <th scope="col">Quién (rol)</th>
              <th scope="col">Qué</th>
              <th scope="col">Entidad</th>
              <th scope="col">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {data.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap">{formatDateTime(l.at)}</td>
                <td>{roleLabels[l.actorRole]}</td>
                <td>{auditActionLabels[l.action]}</td>
                <td className="whitespace-nowrap">
                  {l.entityType}: {l.entityId}
                </td>
                <td className="min-w-[220px]">{l.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------

function ConfigPanel() {
  const { role } = useSession();
  const [testMode, setTestModeState] = useState(isTestMode());
  const toggle = (enabled: boolean) => {
    setTestMode(enabled);
    setTestModeState(enabled);
    recordAudit({
      actorRole: role,
      action: 'configuracion_modo_prueba',
      entityType: 'configuracion',
      entityId: 'modo-prueba',
      reason: enabled ? 'Se activó el modo prueba (30 % de fallos simulados).' : 'Se desactivó el modo prueba.',
    });
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <section className="panel-keylime" aria-labelledby="mod-a">
          <p className="eyebrow">Módulo A</p>
          <h2 id="mod-a" className="title-display mt-1 text-[30px]">
            Información pública
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14.5px]">
            <li>Contiene: agregados DEMO por zona, catálogo, brigadas, directorio y normativa.</li>
            <li>Sin datos personales. Conteos ciudadanos menores a 3 se ocultan.</li>
            <li>Retención: se conserva el histórico agregado por semana; las versiones se marcan con fecha de corte.</li>
            <li>Eliminación: una fuente retirada deja de publicarse y se registra en la bitácora.</li>
          </ul>
        </section>
        <section className="panel-slate" aria-labelledby="mod-b">
          <p className="eyebrow">Módulo B</p>
          <h2 id="mod-b" className="title-display mt-1 text-[30px]">
            Participación y reportes
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14.5px]">
            <li>Contiene: reportes ciudadanos, moderación, canalización y bitácora.</li>
            <li>No pide nombre, teléfono, correo ni domicilio; solo zona aproximada.</li>
            <li>Retención propuesta: texto libre y nombre de foto se eliminan al cerrar el seguimiento + 90 días; se conservan solo agregados.</li>
            <li>El módulo A recibe únicamente agregados del módulo B, nunca registros individuales.</li>
          </ul>
        </section>
      </div>
      <Notice tone="caution" title="Reglas en texto, no implementadas">
        Las reglas de retención y eliminación son propuestas para validar con la revisión jurídica. En esta DEMO no hay servidor que las ejecute.
      </Notice>
      <section className="card" aria-labelledby="modo-prueba">
        <h2 id="modo-prueba" className="text-[18px] font-semibold text-forest">
          Modo prueba de errores
        </h2>
        <p className="mt-1 text-[14.5px] text-muted">
          Hace que el 30 % de las llamadas simuladas fallen para revisar los estados de error y reintento. Solo en memoria. También disponible con
          <code className="mx-1 rounded bg-paper px-1">?modoPrueba=1</code>o la variable <code className="rounded bg-paper px-1">VITE_DEMO_ERROR_RATE</code>.
        </p>
        <label className="mt-4 flex items-center gap-3 text-[15px]">
          <input type="checkbox" className="h-5 w-5 accent-[#0f3e17]" checked={testMode} onChange={(e) => toggle(e.target.checked)} />
          Activar fallos simulados
        </label>
      </section>
    </div>
  );
}
