import { Camera, CheckCircle2, ClipboardList, ImageOff, MessageSquarePlus, ShieldCheck, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { ReportStatusPill, StatusGuide } from '../components/reports/ReportStatus';
import { DataKindBadge, DemoTag } from '../components/ui/Badges';
import { Button, ButtonLink } from '../components/ui/Button';
import { CheckboxField, FormErrorSummary, RadioCards, SelectField, TextAreaField } from '../components/ui/Form';
import { Notice } from '../components/ui/Notice';
import { PageHeader } from '../components/ui/PageHeader';
import { REPORT_COMMENT_MAX } from '../config/demo';
import { TEXTS } from '../config/texts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { regionName, regions } from '../mocks/regions';
import { channelLabels, peopleRangeLabels, reportCategoryHints, reportCategoryLabels, symptomLabels } from '../mocks/reports';
import { ValidationError } from '../services/client';
import { submitReport, validateReportInput } from '../services/reportService';
import type { CitizenReport, NewReportInput, PeopleRange, ReportCategory, ReportChannel, SymptomKey } from '../types';
import { formatDateTime } from '../utils/dates';
import { detectPersonalData } from '../utils/privacy';

const CATEGORIES: ReportCategory[] = ['posible-criadero', 'riesgo-ambiental', 'sintomas-agregados', 'otro'];
const SYMPTOMS = Object.keys(symptomLabels) as SymptomKey[];
const FIELD_ORDER = ['category', 'approximateZone', 'symptoms', 'peopleRange', 'comment', 'acknowledged'] as const;
const FIELD_IDS: Record<(typeof FIELD_ORDER)[number], string> = {
  category: 'reporte-categoria',
  approximateZone: 'reporte-zona',
  symptoms: 'reporte-sintomas',
  peopleRange: 'reporte-personas',
  comment: 'reporte-comentario',
  acknowledged: 'reporte-aviso',
};

interface FormState {
  category: ReportCategory | '';
  approximateZone: string;
  symptoms: SymptomKey[];
  peopleRange: PeopleRange | '';
  comment: string;
  hasSimulatedPhoto: boolean;
  channel: ReportChannel;
  acknowledged: boolean;
}

const EMPTY: FormState = {
  category: '',
  approximateZone: '',
  symptoms: [],
  peopleRange: '',
  comment: '',
  hasSimulatedPhoto: false,
  channel: 'sitio-movil',
  acknowledged: false,
};

function toInput(state: FormState): NewReportInput | null {
  if (!state.category) return null;
  return {
    category: state.category,
    approximateZone: state.approximateZone,
    comment: state.comment,
    hasSimulatedPhoto: state.hasSimulatedPhoto,
    channel: state.channel,
    ...(state.category === 'sintomas-agregados'
      ? { symptoms: { symptoms: state.symptoms, peopleRange: (state.peopleRange || '1-2') as PeopleRange } }
      : {}),
  };
}

function Confirmation({ report, onAnother }: { report: CitizenReport; onAnother: () => void }) {
  return (
    <section aria-labelledby="confirmacion" className="space-y-6">
      <div className="card card-keylime" role="status">
        <CheckCircle2 className="size-8 text-forest-ink" aria-hidden="true" />
        <h2 id="confirmacion" className="mt-3 text-[2rem]">
          Reporte recibido
        </h2>
        <p className="mt-2 leading-relaxed">Guarda tu folio. Es la única referencia del reporte: no está ligado a tu identidad.</p>
        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[12px] bg-cream-paper p-4">
            <dt className="text-sm text-muted">Folio local</dt>
            <dd className="mt-1 font-mono text-[1.25rem] font-semibold tracking-wide text-forest-ink">{report.folio}</dd>
          </div>
          <div className="rounded-[12px] bg-cream-paper p-4">
            <dt className="text-sm text-muted">Estado inicial</dt>
            <dd className="mt-1.5">
              <ReportStatusPill status={report.status} />
            </dd>
          </div>
          <div className="rounded-[12px] bg-cream-paper p-4">
            <dt className="text-sm text-muted">Enviado</dt>
            <dd className="mt-1 font-medium">{formatDateTime(report.createdAt)}</dd>
            <dd className="text-sm text-muted">
              {reportCategoryLabels[report.category]} · {regionName(report.approximateZone)}
            </dd>
          </div>
        </dl>
        <Notice tone="integrity" className="mt-5">
          {TEXTS.reportNotice}
        </Notice>
      </div>

      <div>
        <h3 className="text-[1.375rem]">Qué significa cada estado</h3>
        <div className="mt-3">
          <StatusGuide current={report.status} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ButtonLink to="/mis-reportes" icon={ClipboardList}>
          Consultar mis reportes sin cuenta
        </ButtonLink>
        <Button variant="secondary" icon={MessageSquarePlus} onClick={onAnother}>
          Enviar otro reporte
        </Button>
      </div>
      <p className="text-sm text-muted">El seguimiento está disponible sin iniciar sesión desde este mismo navegador.</p>
    </section>
  );
}

export function ReportNewPage() {
  useDocumentTitle('Enviar un reporte');
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [created, setCreated] = useState<CitizenReport | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const privacyIssues = useMemo(() => detectPersonalData(form.comment), [form.comment]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const validate = (): Record<string, string> => {
    const input = toInput(form);
    const result: Record<string, string> = input ? validateReportInput(input) : { category: 'Elige una categoría.' };
    if (!form.approximateZone) result.approximateZone = 'Elige la zona aproximada.';
    if (form.category === 'sintomas-agregados' && !form.peopleRange) result.peopleRange = 'Indica cuántas personas, de forma aproximada.';
    if (!form.acknowledged) result.acknowledged = 'Confirma que leíste el aviso antes de enviar.';
    return result;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setServiceError(null);
    const found = validate();
    setErrors(found);
    const input = toInput(form);
    if (Object.keys(found).length > 0 || !input) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSubmitting(true);
    try {
      const report = await submitReport(input);
      setCreated(report);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(error.fieldErrors);
        window.requestAnimationFrame(() => summaryRef.current?.focus());
      } else {
        setServiceError(error instanceof Error ? error.message : 'No se pudo enviar el reporte.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const summary = FIELD_ORDER.filter((field) => errors[field]).map((field) => ({
    fieldId: FIELD_IDS[field],
    message: errors[field] ?? '',
  }));

  return (
    <>
      <PageHeader
        eyebrow="Participación ciudadana"
        title="Enviar un reporte"
        description="Cuéntanos qué observaste en tu zona. Sin cuenta, sin descarga y sin datos personales."
        meta={
          <>
            <DataKindBadge kind="reporte-ciudadano" compact />
            <DemoTag />
          </>
        }
      />

      {created ? (
        <Confirmation
          report={created}
          onAnother={() => {
            setCreated(null);
            setForm(EMPTY);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <form noValidate onSubmit={handleSubmit} className="space-y-7" aria-describedby="reporte-privacidad">
            <FormErrorSummary ref={summaryRef} errors={summary} />

            <div id={FIELD_IDS.category} tabIndex={-1} className="outline-none">
              <RadioCards
                name="categoria"
                legend="¿Qué quieres reportar?"
                value={form.category}
                onChange={(value) => set('category', value)}
                error={errors.category}
                options={CATEGORIES.map((category) => ({
                  value: category,
                  label: reportCategoryLabels[category],
                  description: reportCategoryHints[category],
                }))}
              />
            </div>

            <SelectField
              id={FIELD_IDS.approximateZone}
              label="Zona aproximada"
              hint="Elige la zona general. No escribas calles, números ni referencias de una casa."
              value={form.approximateZone}
              error={errors.approximateZone}
              onChange={(event) => set('approximateZone', event.target.value)}
            >
              <option value="">Selecciona una zona</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </SelectField>

            {form.category === 'sintomas-agregados' && (
              <div className="space-y-5 rounded-card bg-ciudadano-50/60 p-4 sm:p-5">
                <Notice tone="caution" title="Esto no es una consulta médica">
                  {TEXTS.emergency} Describe solo lo que observas en tu entorno, sin identificar a nadie.
                </Notice>
                <fieldset id={FIELD_IDS.symptoms} tabIndex={-1} className="outline-none" aria-describedby={errors.symptoms ? 'sintomas-error' : undefined}>
                  <legend className="field-label">Síntomas observados en tu entorno</legend>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {SYMPTOMS.map((symptom) => (
                      <CheckboxField
                        key={symptom}
                        label={symptomLabels[symptom]}
                        checked={form.symptoms.includes(symptom)}
                        onChange={(event) =>
                          set(
                            'symptoms',
                            event.target.checked ? [...form.symptoms, symptom] : form.symptoms.filter((item) => item !== symptom),
                          )
                        }
                      />
                    ))}
                  </div>
                  {errors.symptoms && (
                    <p id="sintomas-error" className="field-error">
                      {errors.symptoms}
                    </p>
                  )}
                </fieldset>
                <div id={FIELD_IDS.peopleRange} tabIndex={-1} className="outline-none">
                  <RadioCards
                    name="personas"
                    legend="¿Cuántas personas, aproximadamente?"
                    hint="Un rango, nunca nombres."
                    columns={3}
                    value={form.peopleRange}
                    onChange={(value) => set('peopleRange', value)}
                    error={errors.peopleRange}
                    options={(Object.keys(peopleRangeLabels) as PeopleRange[]).map((range) => ({
                      value: range,
                      label: peopleRangeLabels[range],
                    }))}
                  />
                </div>
              </div>
            )}

            {form.category && form.category !== 'sintomas-agregados' && (
              <div>
                <p className="field-label">Foto</p>
                <p className="field-hint">La imagen de referencia no se sube ni se guarda en el servidor.</p>
                {form.hasSimulatedPhoto ? (
                  <div className="mt-2 flex items-center gap-4 rounded-[12px] border border-border-mist p-3">
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-[10px] bg-sage-mist" aria-hidden="true">
                      <Camera className="size-7 text-forest-ink" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">Imagen de referencia agregada</p>
                      <Button variant="ghost" size="sm" icon={Trash2} onClick={() => set('hasSimulatedPhoto', false)} className="-ml-3.5">
                        Quitar foto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="secondary" icon={Camera} onClick={() => set('hasSimulatedPhoto', true)} className="mt-2">
                    Mostrar imagen de referencia
                  </Button>
                )}
                <p className="mt-2 flex items-start gap-2 text-sm text-muted">
                  <ImageOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  En un uso real, evita fotografiar personas, rostros, placas de autos o números de casa.
                </p>
              </div>
            )}

            <TextAreaField
              id={FIELD_IDS.comment}
              label="Comentarios"
              optional={form.category !== 'otro'}
              hint={TEXTS.noPersonalData}
              value={form.comment}
              maxLength={REPORT_COMMENT_MAX + 40}
              counter={{ current: form.comment.length, max: REPORT_COMMENT_MAX }}
              error={errors.comment}
              onChange={(event) => set('comment', event.target.value)}
              placeholder="Ejemplo: llantas con agua acumulada en un terreno baldío de la zona."
            />
            {privacyIssues.length > 0 && !errors.comment && (
              <Notice tone="privacy" title="Revisa tu comentario" role="status">
                <ul className="list-disc pl-5">
                  {privacyIssues.map((issue) => (
                    <li key={issue.kind}>{issue.message}</li>
                  ))}
                </ul>
              </Notice>
            )}

            <SelectField
              label="¿Por qué canal llegaste?"
              hint="Sirve para medir la cobertura por canal; no te identifica."
              value={form.channel}
              onChange={(event) => set('channel', event.target.value as ReportChannel)}
            >
              {(Object.keys(channelLabels) as ReportChannel[]).map((channel) => (
                <option key={channel} value={channel}>
                  {channelLabels[channel]}
                </option>
              ))}
            </SelectField>

            <div className="space-y-3 rounded-card bg-keylime-wash p-4 sm:p-5">
              <p className="font-semibold text-forest-ink">Antes de enviar</p>
              <p className="leading-relaxed">{TEXTS.reportNotice}</p>
              <CheckboxField
                id={FIELD_IDS.acknowledged}
                label="Entiendo que mi reporte es una observación y que su envío no garantiza una acción de la autoridad."
                checked={form.acknowledged}
                error={errors.acknowledged}
                onChange={(event) => set('acknowledged', event.target.checked)}
              />
            </div>

            {serviceError && (
              <Notice tone="caution" title="No se pudo enviar" role="alert">
                {serviceError} Tus respuestas siguen aquí; intenta de nuevo.
              </Notice>
            )}

            <Button type="submit" loading={submitting} icon={MessageSquarePlus} className="w-full sm:w-auto">
              {submitting ? 'Enviando…' : 'Enviar reporte'}
            </Button>
          </form>

          <aside className="space-y-4" aria-label="Privacidad del reporte">
            <div id="reporte-privacidad" className="card card-slate">
              <ShieldCheck className="size-6 text-forest-ink" aria-hidden="true" />
              <h2 className="mt-2 text-[1.375rem]">Tu privacidad</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[0.9375rem] leading-relaxed">
                <li>No pedimos nombre, teléfono, correo ni domicilio.</li>
                <li>Solo registramos la zona amplia, nunca coordenadas.</li>
                <li>En vistas públicas, los conteos menores a 3 se muestran como «&lt;3».</li>
                <li>El reporte se guarda únicamente en este navegador.</li>
              </ul>
            </div>
            <Notice tone="integrity">{TEXTS.integrityRule}</Notice>
          </aside>
        </div>
      )}
    </>
  );
}
