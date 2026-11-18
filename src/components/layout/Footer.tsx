import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { TEXTS } from '../../config/texts';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-mist bg-keylime-wash/60 pb-24 lg:pb-0">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-3 rounded-card bg-cream-paper p-5" role="note" aria-label="Aviso de salud">
          <ShieldCheck className="mt-0.5 size-6 shrink-0 text-forest-ink" aria-hidden="true" />
          <p className="text-[1rem] font-medium leading-relaxed text-forest-ink">{TEXTS.footerNotice}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <p className="font-serif text-[1.25rem] text-forest-ink">Ondara Cancún</p>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
              Plataforma de Inteligencia Epidemiológica Participativa. Información preventiva,
              participación ciudadana y seguimiento de observaciones, sin cobro a la ciudadanía
              ni comisiones por pacientes o referencias.
            </p>
          </div>
          <nav aria-label="Enlaces del pie de página">
            <p className="text-sm font-semibold text-charcoal">Información y acceso</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link className="link" to="/como-funciona">Cómo funciona Ondara</Link></li>
              <li><Link className="link" to="/normativa">Normativa y fuentes de datos</Link></li>
              <li><Link className="link" to="/acceso">Acceso administrativo</Link></li>
            </ul>
          </nav>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted">
          Tucanthon 2026 · Los indicadores utilizan datos ilustrativos, no información epidemiológica oficial.
          Mapa base: © colaboradores de OpenStreetMap, servido por OpenFreeMap cuando hay conexión.
        </p>
      </div>
    </footer>
  );
}
