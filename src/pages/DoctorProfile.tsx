import { ArrowLeft, BadgeCheck, CalendarPlus, Languages, MapPin } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ROUTE_ACCESS, canAccess } from '../app/access';
import { useSession } from '../app/SessionContext';
import { DataKindBadge } from '../components/ui/Badges';
import { EmptyState, ErrorState, LoadingState, Notice } from '../components/ui/Feedback';
import { NoCommissionNote } from '../components/ui/NoCommission';
import { PageHeader, SourceNote } from '../components/ui/Layout';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { modalityLabels, providerTypeLabels, weekdayLabels } from '../mocks/doctors';
import { regionName } from '../mocks/regions';
import { sourceById } from '../mocks/sources';
import { getDoctorProfile } from '../services/directoryService';
import type { DoctorSchedule } from '../types';
import { DEMO_CUTOFF_DATE } from '../utils/dates';
import { formatCurrency } from '../utils/format';

export default function DoctorProfile() {
  const { id = '' } = useParams();
  const { role } = useSession();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => getDoctorProfile(id), [id]);
  useDocumentTitle(data?.doctor.name ?? 'Perfil');

  if (loading) return <LoadingState rows={2} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data)
    return (
      <EmptyState
        title="Perfil no encontrado"
        description="No existe un servicio DEMO con ese identificador."
        action={
          <Link className="btn btn-primary" to="/directorio">
            Volver al directorio
          </Link>
        }
      />
    );

  const { doctor, schedules } = data;
  const canBook = canAccess(role, [...ROUTE_ACCESS.citas]);
  const byDay = new Map<number, DoctorSchedule[]>();
  schedules.forEach((s) => byDay.set(s.weekday, [...(byDay.get(s.weekday) ?? []), s]));

  return (
    <>
      <Link to="/directorio" className="link mb-6 inline-flex items-center gap-1.5 text-[14px]">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Directorio
      </Link>
      <PageHeader eyebrow={`${providerTypeLabels[doctor.providerType]} · ${doctor.specialty}`} title={doctor.name} description={doctor.bio} />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="card">
            <div className="flex flex-wrap gap-2">
              <DataKindBadge kind="simulado" />
              <span className="pill bg-paper text-ink">
                <BadgeCheck aria-hidden className="h-3.5 w-3.5" />
                Credencial simulada {doctor.credential}
              </span>
            </div>
            <dl className="mt-5 grid gap-4 text-[15px] sm:grid-cols-2">
              <div>
                <dt className="text-[13px] font-semibold">Problemas de salud que atiende</dt>
                <dd>{doctor.healthProblems.join(', ')}</dd>
              </div>
              <div>
                <dt className="text-[13px] font-semibold">Precio por consulta (DEMO)</dt>
                <dd>{formatCurrency(doctor.priceMxn)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[13px] font-semibold">
                  <MapPin aria-hidden className="h-3.5 w-3.5" />
                  Zona
                </dt>
                <dd>{regionName(doctor.regionId)} (sin dirección en la demo)</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[13px] font-semibold">
                  <Languages aria-hidden className="h-3.5 w-3.5" />
                  Idiomas
                </dt>
                <dd>{doctor.languages.join(', ')}</dd>
              </div>
            </dl>
          </div>
          <div className="card">
            <h2 className="text-[18px] font-semibold text-forest">Horarios (DEMO)</h2>
            <div className="table-wrap mt-3">
              <table className="table">
                <caption className="sr-only">Horarios de atención simulados</caption>
                <thead>
                  <tr>
                    <th scope="col">Día</th>
                    <th scope="col">Horario</th>
                    <th scope="col">Modalidad</th>
                  </tr>
                </thead>
                <tbody>
                  {[...byDay.entries()]
                    .sort(([a], [b]) => ((a + 6) % 7) - ((b + 6) % 7))
                    .flatMap(([day, list]) =>
                      list.map((s, i) => (
                        <tr key={`${day}-${i}`}>
                          <td>{weekdayLabels[day]}</td>
                          <td className="tabular-nums">
                            {s.start}–{s.end}
                          </td>
                          <td>{modalityLabels[s.modality]}</td>
                        </tr>
                      )),
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <aside className="panel-keylime self-start">
          <p className="eyebrow">Cita simulada</p>
          <p className="title-display mt-2 text-[28px]">Agendar con este servicio</p>
          <p className="mt-2 text-[14.5px]">Modalidades: {doctor.modalities.map((m) => modalityLabels[m]).join(' y ')}.</p>
          {canBook ? (
            <Link to={`/citas?servicio=${doctor.id}`} className="btn btn-primary mt-4 w-full">
              <CalendarPlus aria-hidden className="h-4 w-4" />
              Agendar
            </Link>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-primary mt-4 w-full"
                onClick={() => navigate('/acceso', { state: { from: `/citas?servicio=${doctor.id}`, needed: ROUTE_ACCESS.citas } })}
              >
                <CalendarPlus aria-hidden className="h-4 w-4" />
                Agendar
              </button>
              <Notice tone="info" className="mt-3">
                {role === 'invitado'
                  ? 'Para agendar necesitas una sesión DEMO de ciudadano/a.'
                  : 'Tu rol actual no puede agendar citas. Cambia a una sesión DEMO de ciudadano/a.'}
              </Notice>
            </>
          )}
          <div className="mt-4">
            <NoCommissionNote />
          </div>
        </aside>
      </div>
      <SourceNote source={sourceById('src-directorio')} cutoffDate={DEMO_CUTOFF_DATE} />
    </>
  );
}
