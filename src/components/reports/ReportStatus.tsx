import { Archive, CircleDot, ClipboardCheck, Clock, Search, Send, type LucideIcon } from 'lucide-react';
import { reportStatusLabels, reportStatusMeaning, reportStatusOrder } from '../../mocks/reports';
import type { ReportStatus, ReportStatusChange } from '../../types';
import { cx } from '../../utils/cx';
import { formatDateTime } from '../../utils/dates';
import { Pill, type Tone } from '../ui/Badges';

export const reportStatusIcon: Record<ReportStatus, LucideIcon> = {
  pendiente: Clock,
  en_revision: Search,
  verificado: ClipboardCheck,
  canalizado: Send,
  cerrado: Archive,
};

const reportStatusTone: Record<ReportStatus, Tone> = {
  pendiente: 'neutral',
  en_revision: 'blue',
  verificado: 'plum',
  canalizado: 'aqua',
  cerrado: 'closed',
};

export function ReportStatusPill({ status }: { status: ReportStatus }) {
  return (
    <Pill tone={reportStatusTone[status]} icon={reportStatusIcon[status]}>
      {reportStatusLabels[status]}
    </Pill>
  );
}

/** Explica qué significa cada estado. «Verificado» nunca es un caso confirmado. */
export function StatusGuide({ current, compact = false }: { current?: ReportStatus; compact?: boolean }) {
  return (
    <ol className={cx('grid gap-2', !compact && 'sm:grid-cols-2 xl:grid-cols-5')}>
      {reportStatusOrder.map((status, index) => {
        const Icon = reportStatusIcon[status];
        const active = status === current;
        return (
          <li
            key={status}
            className={cx('rounded-[12px] p-3', active ? 'bg-keylime-wash ring-2 ring-forest-ink' : 'bg-cream-paper border border-border-mist')}
            aria-current={active ? 'step' : undefined}
          >
            <p className="flex items-center gap-2 font-semibold text-charcoal">
              <Icon className="size-4 text-forest-ink" aria-hidden="true" />
              <span className="sr-only">Estado {index + 1}: </span>
              {reportStatusLabels[status]}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{reportStatusMeaning[status]}</p>
          </li>
        );
      })}
    </ol>
  );
}

/** Historial de cambios con fecha de cada uno. */
export function StatusTimeline({ history }: { history: ReportStatusChange[] }) {
  return (
    <ol className="relative space-y-4 border-l-2 border-sage-mist pl-5">
      {history.map((change, index) => (
        <li key={`${change.at}-${index}`} className="relative">
          <span className="absolute -left-[1.72rem] top-0.5 inline-flex size-5 items-center justify-center rounded-full bg-cream-paper text-forest-ink" aria-hidden="true">
            <CircleDot className="size-4" />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <ReportStatusPill status={change.status} />
            <time className="text-sm text-muted" dateTime={change.at}>
              {formatDateTime(change.at)}
            </time>
          </div>
          <p className="mt-1 text-[0.9375rem] leading-relaxed">{change.note}</p>
        </li>
      ))}
    </ol>
  );
}
