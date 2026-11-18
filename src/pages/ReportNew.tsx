import { Camera, CheckCircle2, ClipboardList, EyeOff, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ROUTE_ACCESS, canAccess } from '../app/access';
import { useSession } from '../app/SessionContext';
import { ReportStatusPill } from '../components/ui/Badges';
import { Notice } from '../components/ui/Feedback';
import { Field, describedBy, fieldIds } from '../components/ui/Form';
import { PageHeader } from '../components/ui/Layout';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { regions } from '../mocks/regions';
import { reportCategoryHelp, reportCategoryLabels, reportChannelLabels, reportStatusInfo } from '../mocks/reports';
import { createReport, validateReport, type NewReportInput, type ReportValidationErrors } from '../services/reportService';
import type { CitizenReport, ReportCategory, ReportChannel } from '../types';
import { formatDateTime } from '../utils/dates';

const DISCLAIMER = 'Un reporte ciudadano no es un diagnóstico ni un caso confirmado. Su envío no garantiza una acción de la autoridad.';
const COMMENTS_HINT = 'Describe qué observaste y desde cuándo. Sin nombres, teléfonos, correos ni direcciones.';
const ZONE_HINT = 'Solo la zona general. No pedimos ni guardamos direcciones.';

type FormState = Omit<NewReportInput, 'category'> & { category: ReportCategory | '' };

const EMPTY: FormState = { category: '', approximateZone: '', comments: '', simulatedPhotoName: undefined, channel: 'sitio_movil' };

export default function ReportNew() {
  useDocumentTitle('Enviar un reporte');
  const { role } = useSession();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [acknowledged, setAcknowledged] = useState(false);
  const [errors, setErrors] = useState<ReportValidationErrors & { acknowledged?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [created, setCreated] = useState<CitizenReport | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const canTrack = canAccess(role, [...ROUTE_ACCESS.misReportes]);

  useEffect(() => {
    if (created) resultRef.current?.focus();
  }, [created]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const v: ReportValidationErrors & { acknowledged?: string } = validateReport({ ...form, category: form.category || undefined });
    if (!acknowledged) v.acknowledged = 'Confirma que leíste el aviso antes de enviar.';
    setErrors(v);
    const order = ['category', 'approximateZone', 'comments', 'acknowledged'] as const;
    const first = order.find((k) => v[k]);
    if (first) {
      document.getElementById(first === 'category' ? 'rep-category-posible_criadero' : `rep-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      setCreated(await createReport({ ...form, category: form.category as ReportCategory }));
      setForm(EMPTY);
      setAcknowledged(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo enviar el reporte.');
    } finally {
      setSubmitting(false);
    }
  };

  const zoneIds = fieldIds('rep-approximateZone');
  const commentIds = fieldIds('rep-comments');

  if (created) {
    return (
      <>
        <PageHeader eyebrow="Reporte ciudadano" title="Reporte recibido" />
        <div ref={resultRef} tabIndex={-1} className="panel-sage outline-none" role="status">
          <CheckCircle2 aria-hidden className="h-8 w-8 text-forest" />
          <p className="eyebrow mt-3">Tu folio (simulado)</p>
          <p className="title-display mt-1 text-[40px]">{created.folio}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[15px]">
            Estado inicial: <ReportStatusPill status={created.status} />
            <span className="text-muted">{formatDateTime(created.createdAt)}</span>
          </div>
          <p className="mt-3 max-w-2xl text-[15px]">{reportStatusInfo.pendiente.meaning}</p>
          <p className="mt-2 max-w-2xl text-[14px] text-ink">{DISCLAIMER}</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="card">
            <p className="font-semibold text-forest">Seguimiento</p>
            {canTrack ? (
              <p className="mt-1 text-[15px]">Puedes consultar el estado y su historial en «Mis reportes».</p>
            ) : (
              <p className="mt-1 text-[15px]">
                Guarda tu folio. En esta DEMO, el seguimiento se consulta con una sesión de ciudadano/a en este mismo navegador.
              </p>
            )}
            <Link to={canTrack ? '/reportes/mios' : '/acceso'} state={canTrack ? undefined : { from: '/reportes/mios' }} className="btn btn-secondary mt-4">
              <ClipboardList aria-hidden className="h-4 w-4" />
              {canTrack ? 'Ver mis reportes' : 'Entrar como ciudadano/a (DEMO)'}
            </Link>
          </div>
          <div className="card">
            <p className="font-semibold text-forest">¿Otra observación?</p>
            <p className="mt-1 text-[15px]">Cada reporte debe describir una sola observación para que pueda revisarse.</p>
            <button type="button" className="btn btn-primary mt-4" onClick={() => setCreated(null)}>
              Enviar otro reporte
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Participación"
        title="Enviar un reporte"
        description="Una observación breve sobre tu entorno. No necesitas cuenta y no pedimos datos personales."
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form noValidate onSubmit={submit} className="card" aria-labelledby="form-reporte">
          <h2 id="form-reporte" className="sr-only">
            Formulario de reporte
          </h2>

          <fieldset aria-describedby={errors.category ? 'rep-category-error' : undefined}>
            <legend className="field-label">
              Categoría <span className="font-normal text-muted">(obligatorio)</span>
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(reportCategoryLabels) as ReportCategory[]).map((c) => (
                <label
                  key={c}
                  className={`flex cursor-pointer gap-3 rounded-[12px] border p-3.5 transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[#2c6b3a] ${
                    form.category === c ? 'border-forest bg-keylime' : 'border-[#c9c7bf] hover:bg-paper'
                  }`}
                >
                  <input
                    id={`rep-category-${c}`}
                    type="radio"
                    name="categoria"
                    value={c}
                    className="mt-1 accent-[#0f3e17]"
                    checked={form.category === c}
                    onChange={() => set('category', c)}
                  />
                  <span>
                    <span className="block font-medium text-forest">{reportCategoryLabels[c]}</span>
                    <span className="block text-[13px] text-muted">{reportCategoryHelp[c]}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.category && (
              <p id="rep-category-error" className="field-error" role="alert">
                {errors.category}
              </p>
            )}
          </fieldset>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field id="rep-approximateZone" label="Zona aproximada" required hint={ZONE_HINT} error={errors.approximateZone}>
              <select
                id="rep-approximateZone"
                className="input"
                value={form.approximateZone}
                onChange={(e) => set('approximateZone', e.target.value)}
                aria-invalid={Boolean(errors.approximateZone)}
                aria-describedby={describedBy(zoneIds, ZONE_HINT, errors.approximateZone)}
              >
                <option value="">Elige una zona…</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="rep-channel" label="Canal de entrada" hint="Cómo llegaste a este formulario (DEMO).">
              <select
                id="rep-channel"
                className="input"
                value={form.channel}
                onChange={(e) => set('channel', e.target.value as ReportChannel)}
                aria-describedby="rep-channel-ayuda"
              >
                {(Object.keys(reportChannelLabels) as ReportChannel[]).map((c) => (
                  <option key={c} value={c}>
                    {reportChannelLabels[c]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field id="rep-comments" label="Comentarios" required hint={COMMENTS_HINT} error={errors.comments} className="mt-6">
            <textarea
              id="rep-comments"
              className="input min-h-[120px]"
              maxLength={400}
              value={form.comments}
              onChange={(e) => set('comments', e.target.value)}
              aria-invalid={Boolean(errors.comments)}
              aria-describedby={describedBy(commentIds, COMMENTS_HINT, errors.comments)}
            />
          </Field>
          <p className="mt-1 text-right text-[12.5px] text-muted" aria-live="polite">
            {form.comments.length}/400
          </p>

          <div className="mt-4">
            <label htmlFor="rep-foto" className="field-label">
              Foto (opcional, simulada)
            </label>
            <label
              htmlFor="rep-foto"
              className="flex min-h-[56px] cursor-pointer items-center gap-3 rounded-[12px] border border-dashed border-[#c9c7bf] px-4 text-[14.5px] hover:bg-paper has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[#2c6b3a]"
            >
              <Camera aria-hidden className="h-5 w-5 text-forest" />
              {form.simulatedPhotoName ? `Seleccionada: ${form.simulatedPhotoName}` : 'Elegir imagen'}
              <input
                id="rep-foto"
                type="file"
                accept="image/*"
                className="sr-only"
                aria-describedby="rep-foto-ayuda"
                onChange={(e) => set('simulatedPhotoName', e.target.files?.[0]?.name)}
              />
            </label>
            <p id="rep-foto-ayuda" className="field-hint">
              DEMO: la imagen no se sube ni se guarda; solo se registra su nombre. Evita fotos con personas, rostros o placas.
            </p>
            {form.simulatedPhotoName && (
              <button type="button" className="link mt-1 text-[13px]" onClick={() => set('simulatedPhotoName', undefined)}>
                Quitar foto
              </button>
            )}
          </div>

          <div className="mt-6 rounded-[12px] bg-caution-bg p-4">
            <p className="text-[14.5px] font-semibold text-caution">Antes de enviar</p>
            <p className="mt-1 text-[14.5px]">{DISCLAIMER}</p>
            <label className="mt-3 flex items-start gap-3 text-[14.5px]">
              <input
                id="rep-acknowledged"
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[#0f3e17]"
                checked={acknowledged}
                onChange={(e) => {
                  setAcknowledged(e.target.checked);
                  setErrors((er) => ({ ...er, acknowledged: undefined }));
                }}
                aria-invalid={Boolean(errors.acknowledged)}
                aria-describedby={errors.acknowledged ? 'rep-acknowledged-error' : undefined}
              />
              Entiendo que mi reporte es una observación y no garantiza una acción de la autoridad.
            </label>
            {errors.acknowledged && (
              <p id="rep-acknowledged-error" className="field-error" role="alert">
                {errors.acknowledged}
              </p>
            )}
          </div>

          {submitError && (
            <Notice tone="danger" role="alert" className="mt-4" title="No se pudo enviar">
              {submitError} Tus datos siguen en el formulario; intenta de nuevo.
            </Notice>
          )}
          <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto" disabled={submitting}>
            <Send aria-hidden className="h-4 w-4" />
            {submitting ? 'Enviando…' : 'Enviar reporte'}
          </button>
        </form>

        <aside className="space-y-4 self-start">
          <div className="panel-keylime">
            <EyeOff aria-hidden className="mb-3 h-6 w-6 text-forest" />
            <p className="font-semibold text-forest">Sin datos personales</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[14.5px]">
              <li>No pedimos nombre, teléfono, correo ni domicilio.</li>
              <li>Solo zona aproximada; nunca se publica tu ubicación.</li>
              <li>No ofrecemos WhatsApp como canal anónimo: revela tu número.</li>
              <li>Reportar es gratuito.</li>
            </ul>
          </div>
          <div className="card">
            <p className="font-semibold text-forest">Qué pasa después</p>
            <p className="mt-1 text-[14.5px]">
              Tu reporte inicia como <strong>pendiente</strong>. El equipo revisa si es completo y pertinente; si es útil puede canalizarse al
              área responsable, que decide si actúa.
            </p>
            <Link to="/como-funciona#estados" className="link mt-2 inline-block text-[14px]">
              Ver el significado de cada estado
            </Link>
          </div>
          {canTrack && (
            <Link to="/reportes/mios" className="btn btn-secondary w-full">
              <ClipboardList aria-hidden className="h-4 w-4" />
              Mis reportes
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
