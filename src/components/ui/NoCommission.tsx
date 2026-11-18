import { HandCoins } from 'lucide-react';

/** Leyenda obligatoria en cada tarjeta y perfil del directorio. */
export function NoCommissionNote() {
  return (
    <p className="flex items-start gap-2 rounded-[10px] bg-slate-soft px-3 py-2 text-[12.5px] text-info">
      <HandCoins aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      Directorio informativo. Ondara no cobra comisiones ni recibe pagos por referencias.
    </p>
  );
}
