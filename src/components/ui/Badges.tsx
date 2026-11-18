import { FlaskConical } from 'lucide-react';
import { DATA_KINDS, type DataKind } from '../../config/dataKinds';
import { reportStatusInfo } from '../../mocks/reports';
import type { ReportStatus } from '../../types';

/** Etiqueta DEMO obligatoria junto a todo dato simulado. */
export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`pill border border-dashed border-[#8b8a83] bg-paper text-[#3d3d3a] ${className}`}
      title="Información simulada para validación"
    >
      <FlaskConical aria-hidden className="h-3.5 w-3.5" />
      DEMO
    </span>
  );
}

/** Insignia de tipo de dato: color + icono + texto. */
export function DataKindBadge({ kind, short = false, className = '' }: { kind: DataKind; short?: boolean; className?: string }) {
  const info = DATA_KINDS[kind];
  const Icon = info.icon;
  return (
    <span className={`pill ${className}`} style={{ background: info.bg, color: info.color }}>
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {short ? info.shortLabel : info.label}
    </span>
  );
}

const statusStyles: Record<ReportStatus, { bg: string; color: string; dot: string }> = {
  pendiente: { bg: '#ecebe6', color: '#3d3d3a', dot: '○' },
  en_revision: { bg: '#f8efd6', color: '#6b4a00', dot: '◐' },
  verificado: { bg: '#e7e4f8', color: '#4b3cb0', dot: '◆' },
  canalizado: { bg: '#e3edf0', color: '#1f4f63', dot: '➜' },
  cerrado: { bg: '#e1f4df', color: '#0f3e17', dot: '●' },
};

export function ReportStatusPill({ status }: { status: ReportStatus }) {
  const s = statusStyles[status];
  return (
    <span className="pill" style={{ background: s.bg, color: s.color }}>
      <span aria-hidden>{s.dot}</span>
      {reportStatusInfo[status].label}
    </span>
  );
}
