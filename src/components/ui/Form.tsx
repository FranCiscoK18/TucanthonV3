/**
 * Controles de formulario accesibles: etiqueta visible, ayuda y error asociados
 * con `aria-describedby`, y `aria-invalid` cuando hay error.
 */
import { CircleAlert } from 'lucide-react';
import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, type InputHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

interface FieldMeta {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
}

function describedBy(id: string, hint?: ReactNode, error?: string): string | undefined {
  const ids = [hint ? `${id}-ayuda` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

function FieldText({ id, hint, error }: { id: string; hint?: ReactNode; error?: string }) {
  return (
    <>
      {hint && (
        <p id={`${id}-ayuda`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </>
  );
}

function Label({ htmlFor, label, optional }: { htmlFor: string; label: ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="field-label">
      {label}
      {optional && <span className="ml-1.5 font-normal text-muted">(opcional)</span>}
    </label>
  );
}

type SelectFieldProps = FieldMeta & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode };

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, hint, error, optional, id, className, children, ...rest },
  ref,
) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className={className}>
      <Label htmlFor={fieldId} label={label} optional={optional} />
      <select
        ref={ref}
        id={fieldId}
        className="field-control appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%230f3e17%22><path d=%22M5.5 7.5 10 12l4.5-4.5%22 stroke=%22%230f3e17%22 stroke-width=%221.6%22 fill=%22none%22 stroke-linecap=%22round%22/></svg>')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        {...rest}
      >
        {children}
      </select>
      <FieldText id={fieldId} hint={hint} error={error} />
    </div>
  );
});

type InputFieldProps = FieldMeta & InputHTMLAttributes<HTMLInputElement>;

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { label, hint, error, optional, id, className, ...rest },
  ref,
) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className={className}>
      <Label htmlFor={fieldId} label={label} optional={optional} />
      <input
        ref={ref}
        id={fieldId}
        className="field-control"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        {...rest}
      />
      <FieldText id={fieldId} hint={hint} error={error} />
    </div>
  );
});

type TextAreaFieldProps = FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement> & { counter?: { current: number; max: number } };

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(
  { label, hint, error, optional, id, className, counter, ...rest },
  ref,
) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={fieldId} label={label} optional={optional} />
        {counter && (
          <span className={cx('text-sm tabular-nums', counter.current > counter.max ? 'font-semibold text-danger-700' : 'text-muted')}>
            {counter.current}/{counter.max}
          </span>
        )}
      </div>
      <textarea
        ref={ref}
        id={fieldId}
        className="field-control min-h-28 resize-y"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        {...rest}
      />
      <FieldText id={fieldId} hint={hint} error={error} />
    </div>
  );
});

type CheckboxFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
};

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(function CheckboxField(
  { label, hint, error, id, className, ...rest },
  ref,
) {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={fieldId}
          type="checkbox"
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-forest-ink"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, hint, error)}
          {...rest}
        />
        <label htmlFor={fieldId} className="cursor-pointer leading-snug">
          {label}
        </label>
      </div>
      <div className="pl-8">
        <FieldText id={fieldId} hint={hint} error={error} />
      </div>
    </div>
  );
});

/** Grupo de opciones (radio) presentado como tarjetas seleccionables. */
export function RadioCards<T extends string>({
  name,
  legend,
  hint,
  error,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  legend: ReactNode;
  hint?: ReactNode;
  error?: string;
  options: Array<{ value: T; label: string; description?: string; icon?: ReactNode; disabled?: boolean }>;
  value: T | '';
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4;
}) {
  const id = useId();
  const grid = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[columns];
  return (
    <fieldset aria-describedby={describedBy(id, hint, error)} aria-invalid={error ? true : undefined}>
      <legend className="field-label">{legend}</legend>
      <FieldText id={id} hint={hint} />
      <div className={cx('mt-2 grid grid-cols-1 gap-2.5', grid)}>
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cx(
                'relative flex min-h-11 cursor-pointer items-start gap-3 rounded-[12px] border px-3.5 py-3 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest-ink',
                checked ? 'border-forest-ink bg-keylime-wash' : 'border-line/70 bg-cream-paper hover:border-forest-ink',
                option.disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                className="mt-1 size-4 shrink-0 accent-forest-ink"
              />
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-medium text-charcoal">
                  {option.icon}
                  {option.label}
                </span>
                {option.description && <span className="mt-0.5 block text-sm text-muted">{option.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </fieldset>
  );
}

/** Resumen de errores enfocable tras un envío fallido, con enlaces a cada campo. */
export const FormErrorSummary = forwardRef<HTMLDivElement, { errors: Array<{ fieldId: string; message: string }> }>(
  function FormErrorSummary({ errors }, ref) {
    if (errors.length === 0) return null;
    return (
      <div ref={ref} tabIndex={-1} className="rounded-[12px] bg-danger-50 px-4 py-3.5 text-danger-700 outline-none focus-visible:outline-3" role="alert">
        <p className="font-semibold">Revisa {errors.length === 1 ? 'el siguiente campo' : `los siguientes ${errors.length} campos`}:</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5">
          {errors.map((error) => (
            <li key={error.fieldId}>
              <a className="underline underline-offset-2" href={`#${error.fieldId}`}>
                {error.message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  },
);
