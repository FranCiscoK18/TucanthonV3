/**
 * Diálogo modal basado en `<dialog>` nativo: atrapa el foco, se cierra con Esc
 * y devuelve el foco al elemento que lo abrió.
 */
import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      returnFocus.current?.focus();
      onClose();
    };
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cx(
        'm-auto w-[calc(100%-2rem)] rounded-card bg-cream-paper p-0 text-charcoal backdrop:bg-forest-shadow/45',
        size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
      )}
      onClick={(event) => {
        if (event.target === ref.current) ref.current?.close();
      }}
    >
      {open && (
        <div className="max-h-[85dvh] overflow-y-auto p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="text-[1.5rem]">
              {title}
            </h2>
            <button
              type="button"
              className="-mr-2 -mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-forest-ink hover:bg-keylime-wash"
              onClick={() => ref.current?.close()}
              aria-label="Cerrar"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          {description && (
            <div id={descriptionId} className="mt-2 text-muted">
              {description}
            </div>
          )}
          {children && <div className="mt-5">{children}</div>}
          {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
