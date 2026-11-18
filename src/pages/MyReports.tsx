import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataKindBadge, ReportStatusPill } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { PageHeader, Section } from '../components/ui/Layout';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { regionName } from '../mocks/regions';
import { reportCategoryLabels, reportChannelLabels, reportStatusInfo, reportStatusOrder } from '../mocks/reports';
import { deleteOwnReport, getOwnReports } from '../services/reportService';
import type { CitizenReport } from '../types';
import { formatDateTime } from '../utils/dates';

export default function MyReports() {
  useDocumentTitle('Mis reportes');
  const { data, loading, error, reload } = useAsync(getOwnReports, []);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const remove = async (id: string) => {
    if (!window.confirm('¿Eliminar este reporte de este navegador? Esta acción no se puede deshacer.')) return;
    setDeleteError(null);
    try {
      await deleteOwnReport(id);
      reload();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar.');
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Seguimiento"
        title="Mis reportes"
        description="Reportes enviados desde este navegador, con su estado y la fecha de cada cambio. Ningún estado implica una acción garantizada de la autoridad."
        actions={
          <Link to="/reportes" className="btn btn-primary">
            <Plus aria-hidden className="h-4 w-4" />
            Nuevo reporte
          </Link>
        }
      />
      {deleteError && (
        <Notice tone="danger" role="alert" className="mb-4">
          {deleteError}
        </Notice>
      )}

      {loading ? (
        <LoadingState variant="list" rows={3} />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState
          icon={ClipboardList}
          title="Todavía no hay reportes"
          description="Los reportes que envíes desde este navegador aparecerán aquí con su folio y estado."
          action={
            <Link to="/reportes" className="btn btn-primary">
              Enviar un reporte
            </Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {data.map((r) => (
            <li key={r.id}>
              <ReportCard report={r} onDelete={() => remove(r.id)} />
            </li>
          ))}
        </ul>
      )}

      <Section id="estados" eyebrow="Glosario" title="Qué significa cada estado">
        <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {reportStatusOrder.map((s) => (
            <div key={s} className="rounded-[14px] bg-paper p-4">
              <dt>
                <ReportStatusPill status={s} />
              </dt>
              <dd className="mt-2 text-[14px]">{reportStatusInfo[s].meaning}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </>
  );
}

function ReportCard({ report: r, onDelete }: { report: CitizenReport; onDelete: () => void }) {
  return (
    <article className="card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <DataKindBadge kind="ciudadano" short />
            <ReportStatusPill status={r.status} />
          </div>
          <h2 className="mt-3 text-[19px] font-semibold text-forest">
            {reportCategoryLabels[r.category]} · {regionName(r.approximateZone)}
          </h2>
          <p className="text-[13px] text-muted">
            Folio {r.folio} · {reportChannelLabels[r.channel]} · {formatDateTime(r.createdAt)}
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm self-start" onClick={onDelete}>
          <Trash2 aria-hidden className="h-4 w-4" />
          Eliminar
        </button>
      </div>
      <p className="mt-3 text-[15px]">{r.comments}</p>
      {r.simulatedPhotoName && <p className="mt-1 text-[13px] text-muted">Foto simulada: {r.simulatedPhotoName} (no se guardó la imagen)</p>}
      <p className="mt-3 rounded-[10px] bg-paper px-3 py-2 text-[14px]">
        <span className="font-semibold">Estado actual: </span>
        {reportStatusInfo[r.status].meaning}
      </p>
      <h3 className="mt-4 text-[14px] font-semibold">Historial</h3>
      <ol className="mt-2 border-l-2 border-hairline pl-4">
        {r.history.map((h, i) => (
          <li key={i} className="relative pb-3 last:pb-0">
            <span aria-hidden className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-cream bg-forest" />
            <p className="flex flex-wrap items-center gap-2 text-[14px]">
              <ReportStatusPill status={h.status} />
              <time dateTime={h.at} className="text-muted">
                {formatDateTime(h.at)}
              </time>
            </p>
            <p className="mt-1 text-[14px]">{h.note}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}
