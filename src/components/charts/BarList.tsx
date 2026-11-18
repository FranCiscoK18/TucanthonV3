/**
 * Barras horizontales para una sola medida entre categorías: un solo color,
 * barras delgadas (≤ 24 px) con extremo redondeado y valor en la punta.
 * Una categoría puede resaltarse; las demás quedan en un tono atenuado.
 */
import { cx } from '../../utils/cx';

export interface BarItem {
  id: string;
  label: string;
  value: number;
  display?: string;
  note?: string;
  emphasis?: boolean;
}

export function BarList({
  items,
  ariaLabel,
  color = '#2f6b3a',
  mutedColor = '#a9c4a6',
  max,
  highlightMode = false,
}: {
  items: BarItem[];
  ariaLabel: string;
  color?: string;
  mutedColor?: string;
  max?: number;
  /** Si es `true`, solo los elementos con `emphasis` usan el color principal. */
  highlightMode?: boolean;
}) {
  const top = Math.max(max ?? 0, ...items.map((item) => item.value), 1);
  return (
    <ul className="space-y-3" aria-label={ariaLabel}>
      {items.map((item) => {
        const share = Math.max(0, item.value) / top;
        const fill = !highlightMode || item.emphasis ? color : mutedColor;
        return (
          <li key={item.id}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={cx('min-w-0', item.emphasis ? 'font-semibold text-charcoal' : 'text-charcoal')}>{item.label}</span>
              {item.note && <span className="shrink-0 text-xs text-muted">{item.note}</span>}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-4 min-w-0 flex-1">
                <div
                  className="h-4 rounded-r-[4px]"
                  style={{ width: `${Math.max(item.value > 0 ? 1.5 : 0, share * 100)}%`, backgroundColor: fill }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-sm font-semibold text-charcoal tabular-nums">
                {item.display ?? item.value.toLocaleString('es-MX')}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
