import type { ReactNode } from 'react';
import { cx } from '../../utils/cx';

/** Encabezado de vista: etiqueta superior, título serif, descripción y metadatos. */
export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx('mb-8 animate-rise', className)}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-[2.125rem] sm:text-[2.75rem]">{title}</h1>
          {description && <div className="mt-3 text-[1.0625rem] leading-relaxed text-muted">{description}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
      {meta && <div className="mt-4 flex flex-wrap items-center gap-2">{meta}</div>}
    </header>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  actions,
  as: Tag = 'h2',
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  as?: 'h2' | 'h3';
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <Tag id={id} className={Tag === 'h2' ? 'text-[1.75rem] sm:text-[2rem]' : 'text-[1.375rem]'}>
          {title}
        </Tag>
        {description && <div className="mt-2 leading-relaxed text-muted">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
