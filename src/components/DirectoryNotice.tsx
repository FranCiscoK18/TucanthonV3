import { BadgeInfo } from 'lucide-react';
import { TEXTS } from '../config/texts';
import { cx } from '../utils/cx';

/** Leyenda obligatoria del directorio en cada tarjeta y perfil. */
export function DirectoryNotice({ className }: { className?: string }) {
  return (
    <p className={cx('flex items-start gap-2 rounded-[10px] bg-keylime-wash px-3 py-2 text-sm text-forest-ink', className)}>
      <BadgeInfo className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {TEXTS.directoryNotice}
    </p>
  );
}
