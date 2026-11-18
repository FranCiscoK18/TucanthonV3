import type { ReactNode } from 'react';

export interface FieldIds {
  inputId: string;
  hintId: string;
  errorId: string;
}

export const fieldIds = (id: string): FieldIds => ({ inputId: id, hintId: `${id}-ayuda`, errorId: `${id}-error` });

/** `aria-describedby` combinado para hint y error. */
export function describedBy(ids: FieldIds, hint?: string, error?: string): string | undefined {
  const parts = [hint ? ids.hintId : null, error ? ids.errorId : null].filter(Boolean);
  return parts.length ? parts.join(' ') : undefined;
}

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className = '',
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const ids = fieldIds(id);
  return (
    <div className={className}>
      <label htmlFor={ids.inputId} className="field-label">
        {label}
        {required && (
          <span className="ml-1 font-normal text-muted">
            (obligatorio)
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={ids.hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={ids.errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
