import { CalendarDays, Globe, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSession } from '../app/SessionContext';
import { DataKindBadge } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { NoCommissionNote } from '../components/ui/NoCommission';
import { PageHeader, Section } from '../components/ui/Layout';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { doctorById, modalityLabels } from '../mocks/doctors';
import { regionName } from '../mocks/regions';
import { getDoctorAgenda, type AgendaItem } from '../services/appointmentService';
import { formatLongDate } from '../utils/dates';
import { formatCurrency } from '../utils/format';

export default function DoctorPanel() {
  useDocumentTitle('Mi perfil y agenda');
  const { session } = useSession();
  const doctorId = session?.doctorId ?? 'doc-01';
  const doctor = doctorById(doctorId);
  const { data, loading, error, reload } = useAsync(() => getDoctorAgenda(doctorId), [doctorId]);

  const byDate = new Map<string, AgendaItem[]>();
  (data ?? []).forEach((a) => byDate.set(a.date, [...(byDate.get(a.date) ?? []), a]));

  return (
    <>
      <PageHeader
        eyebrow="Rol médico DEMO"
        title="Mi perfil y agenda"
        description="Vista simulada para profesionales del directorio. Este rol no tiene acceso a reportes ciudadanos individuales."
      />
      {doctor && (
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="card">
            <DataKindBadge kind="simulado" />
            <h2 className="title-display mt-3 text-[32px]">{doctor.name}</h2>
            <p className="text-[15px]">
              {doctor.specialty} · Credencial simulada {doctor.credential}
            </p>
            <ul className="mt-3 space-y-1 text-[14.5px]">
              <li className="flex items-center gap-2">
                <MapPin aria-hidden className="h-4 w-4 text-muted" /> Zona {regionName(doctor.regionId)}
              </li>
              <li className="flex items-center gap-2">
                <Globe aria-hidden className="h-4 w-4 text-muted" /> {doctor.modalities.map((m) => modalityLabels[m]).join(' · ')}
              </li>
              <li>Precio DEMO: {formatCurrency(doctor.priceMxn)}</li>
            </ul>
            <Link to={`/directorio/${doctor.id}`} className="link mt-4 inline-block text-[14px]">
              Ver mi perfil público
            </Link>
          </div>
          <div className="space-y-3">
            <NoCommissionNote />
            <Notice tone="info" title="Privacidad">
              La agenda solo muestra folio, fecha, hora y modalidad. No incluye datos personales de pacientes.
            </Notice>
          </div>
        </div>
      )}

      <Section id="agenda" eyebrow="Próximos 7 días" title="Agenda simulada">
        {loading ? (
          <LoadingState variant="list" rows={3} />
        ) : error ? (
          <ErrorState error={error} onRetry={reload} />
        ) : byDate.size === 0 ? (
          <EmptyState icon={CalendarDays} title="Sin citas próximas" description="Cuando un ciudadano/a DEMO agende contigo, la cita aparecerá aquí." />
        ) : (
          <ul className="space-y-4">
            {[...byDate.entries()].map(([date, items]) => (
              <li key={date} className="card">
                <h3 className="font-semibold capitalize text-forest">{formatLongDate(date)}</h3>
                <ul className="mt-3 divide-y divide-hairline">
                  {items.map((a) => (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[14.5px]">
                      <span className="font-medium tabular-nums">{a.time}</span>
                      <span>{a.label}</span>
                      <span className="text-muted">{modalityLabels[a.modality]}</span>
                      <span className={`pill ${a.origin === 'navegador' ? 'bg-success-bg text-success' : 'bg-paper text-muted'}`}>
                        {a.origin === 'navegador' ? 'Agendada en este navegador' : 'Ejemplo DEMO'}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
