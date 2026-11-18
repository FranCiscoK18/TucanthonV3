import { Camera, MessageSquarePlus, Send, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ReportStatusPill, StatusGuide, StatusTimeline } from '../components/reports/ReportStatus';
import { Button, ButtonLink } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { TextAreaField } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { PageHeader, SectionHeading } from '../components/ui/PageHeader';
import { AsyncContent, EmptyState, LoadingState } from '../components/ui/States';
import { REPORT_COMMENT_MAX } from '../config/demo';
import { TEXTS } from '../config/texts';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { regionName } from '../mocks/regions';
import { channelLabels, peopleRangeLabels, reportCategoryLabels, symptomLabels } from '../mocks/reports';
import { ValidationError } from '../services/client';
import { addMoreInfo, deleteMyReport, listMyReports } from '../services/reportService';
import type { CitizenReport } from '../types';
import { formatDateTime } from '../utils/dates';

function MoreInfoForm({ report, onSaved }: { report: CitizenReport; onSaved: (report: CitizenReport) => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const request = [...report.history].reverse().find((change) => change.action === 'pedir-ampliacion');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      onSaved(await addMoreInfo(report.id, text));
      setText('');
    } catch (cause) {
      setError(cause instanceof ValidationError ? (cause.fieldErrors.additionalInfo ?? cause.message) : cause instanceof Error ? cause.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mt-4 space-y-3 rounded-[12px] bg-revisado-50 p-4">
      <p className="font-semibold text-revisado-700">Moderación pidió ampliar la información</p>
      {request && <p className="text-sm">{request.note}</p>}
      <TextAreaField
        label="Información adicional"
        hint={TEXTS.noPersonalData}
        value={text}
        onChange={(event) => setText(event.target.value)}
        counter={{ current: text.length, max: REPORT_COMMENT_MAX }}
        error={error}
      />
      <Button type="submit" size="sm" icon={Send} loading={saving}>
        Enviar ampliación
      </Button>
    </form>
  );
}

function ReportItem({
  report,
  onUpdated,
  onDelete,
}: {
  report: CitizenReport;
  onUpdated: (report: CitizenReport) => void;
  onDelete: (report: CitizenReport) => void;
}) {
  return (
    <article className="card card-cream" aria-labelledby={`folio-${report.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Folio</p>
          <h3 id={`folio-${report.id}`} className="font-mono text-[1.25rem] font-semibold tracking-wide text-forest-ink">
            {report.folio}
          </h3>
        </div>
        <ReportStatusPill status={report.status} />
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Categoría</dt>
          <dd className="font-medium">{reportCategoryLabels[report.category]}</dd>
        </div>
        <div>
          <dt className="text-muted">Zona aproximada</dt>
          <dd className="font-medium">{regionName(report.approximateZone)}</dd>
        </div>
        <div>
          <dt className="text-muted">Enviado</dt>
          <dd>{formatDateTime(report.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted">Canal</dt>
          <dd>{channelLabels[report.channel]}</dd>
        </div>
      </dl>
      {report.symptoms && (
        <p className="mt-3 text-sm">
          <span className="text-muted">Síntomas observados: </span>
          {report.symptoms.symptoms.map((symptom) => symptomLabels[symptom]).join(', ')} · {peopleRangeLabels[report.symptoms.peopleRange]}
        </p>
      )}
      {report.comment && <p className="mt-3 leading-relaxed">«{report.comment}»</p>}
      {report.additionalInfo && (
        <p className="mt-2 text-sm leading-relaxed">
          <span className="text-muted">Ampliación: </span>«{report.additionalInfo}»
        </p>
      )}
      {report.hasSimulatedPhoto && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
          <Camera className="size-4" aria-hidden="true" /> Imagen de referencia (no se almacena ninguna imagen)
        </p>
      )}

      {report.awaitingMoreInfo && <MoreInfoForm report={report} onSaved={onUpdated} />}

      <details className="mt-4 border-t border-border-mist pt-3">
        <summary className="cursor-pointer py-1 font-semibold text-forest-ink">Seguimiento ({report.history.length} cambios)</summary>
        <div className="mt-4">
          <StatusTimeline history={report.history} />
        </div>
      </details>

      <div className="mt-4 flex justify-end">
        <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onDelete(report)}>
          Eliminar de este navegador
        </Button>
      </div>
    </article>
  );
}

export function MyReportsPage() {
  useDocumentTitle('Mis reportes');
  const { resource, data, reload, mutate } = useAsync(listMyReports, []);
  const [toDelete, setToDelete] = useState<CitizenReport | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const replace = (updated: CitizenReport) => {
    if (!data) return;
    mutate(data.map((report) => (report.id === updated.id ? updated : report)));
    setMessage(`Se agregó la ampliación al reporte ${updated.folio}. La revisión continúa.`);
  };

  const confirmDelete = async () => {
    if (!toDelete || !data) return;
    setDeleting(true);
    try {
      await deleteMyReport(toDelete.id);
      mutate(data.filter((report) => report.id !== toDelete.id));
      setMessage(`Se eliminó el reporte ${toDelete.folio} de este navegador.`);
      setToDelete(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Seguimiento"
        title="Mis reportes"
        description="Reportes enviados desde este navegador. No están ligados a tu identidad: el folio es la única referencia."
        actions={
          <ButtonLink to="/reportar" icon={MessageSquarePlus}>
            Enviar un reporte
          </ButtonLink>
        }
      />

      <Notice tone="integrity" className="mb-6">
        {TEXTS.integrityRule} El estado refleja lo que se ha documentado; no promete actuaciones que la autoridad no haya aceptado.
      </Notice>

      {message && (
        <Notice tone="tip" className="mb-6" role="status">
          {message}
        </Notice>
      )}

      <h2 className="sr-only">Reportes enviados desde este navegador</h2>
      <AsyncContent resource={resource} onRetry={reload} loading={<LoadingState lines={3} />}>
        {(reports) =>
          reports.length === 0 ? (
            <EmptyState
              title="Aún no hay reportes en este navegador"
              description="Cuando envíes un reporte, aquí verás su folio, su estado y cada cambio con su fecha."
              action={
                <ButtonLink to="/reportar" icon={MessageSquarePlus}>
                  Enviar un reporte
                </ButtonLink>
              }
            />
          ) : (
            <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {reports.map((report) => (
                <li key={report.id}>
                  <ReportItem report={report} onUpdated={replace} onDelete={setToDelete} />
                </li>
              ))}
            </ul>
          )
        }
      </AsyncContent>

      <section aria-labelledby="estados" className="mt-14">
        <SectionHeading id="estados" title="Qué significa cada estado" />
        <StatusGuide />
      </section>

      <Dialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="¿Eliminar este reporte de tu navegador?"
        description={`El folio ${toDelete?.folio ?? ''} dejará de aparecer aquí. Los reportes locales solo existen en este navegador.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" icon={Trash2} loading={deleting} onClick={confirmDelete}>
              Eliminar
            </Button>
          </>
        }
      />
    </>
  );
}
