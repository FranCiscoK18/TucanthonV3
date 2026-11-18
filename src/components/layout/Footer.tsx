import { FlaskConical, ShieldCheck, Trash2 } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { TEXTS } from '../../config/texts';
import { getServiceConfig, setTestMode, subscribeServiceConfig } from '../../services/config';
import { clearDemoStorage } from '../../services/storage';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';

function useTestMode(): boolean {
  return useSyncExternalStore(
    (listener) => subscribeServiceConfig(listener),
    () => getServiceConfig().testMode,
  );
}

export function Footer() {
  const testMode = useTestMode();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <footer className="mt-auto border-t border-border-mist bg-keylime-wash/60 pb-24 lg:pb-0">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex gap-3 rounded-card bg-cream-paper p-5" role="note" aria-label="Aviso permanente">
          <ShieldCheck className="mt-0.5 size-6 shrink-0 text-forest-ink" aria-hidden="true" />
          <p className="text-[1rem] font-medium leading-relaxed text-forest-ink">{TEXTS.footerNotice}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <p className="font-serif text-[1.25rem] text-forest-ink">Ondara Cancún</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Plataforma de Inteligencia Epidemiológica Participativa. Prototipo de frontend con datos simulados para validación.
              Sin cobro a la ciudadanía y sin comisiones por pacientes o referencias.
            </p>
          </div>
          <nav aria-label="Enlaces del pie de página">
            <p className="text-sm font-semibold text-charcoal">Transparencia</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>
                <Link className="link" to="/como-funciona">
                  Cómo funciona y qué no hace Ondara
                </Link>
              </li>
              <li>
                <Link className="link" to="/normativa">
                  Normativa y fuentes de datos DEMO
                </Link>
              </li>
              <li>
                <Link className="link" to="/acceso">
                  Roles de la demostración
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="text-sm font-semibold text-charcoal">Herramientas de la DEMO</p>
            <div className="mt-2 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  role="switch"
                  checked={testMode}
                  onChange={(event) => setTestMode(event.target.checked)}
                  className="mt-0.5 size-5 shrink-0 accent-forest-ink"
                  aria-describedby="modo-prueba-ayuda"
                />
                <span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <FlaskConical className="size-4" aria-hidden="true" /> Modo prueba de fallos
                  </span>
                  <span id="modo-prueba-ayuda" className="block text-muted">
                    Algunas cargas fallarán al azar para revisar los estados de error.
                  </span>
                </span>
              </label>
              <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setConfirmOpen(true)} className="-ml-3.5">
                Borrar datos locales de la DEMO
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted">
          Prototipo DEMO · Tucanthon 2026. Mapa base: © colaboradores de OpenStreetMap, servido por OpenFreeMap cuando hay
          conexión. Las zonas, conteos, perfiles y eventos son ficticios.
        </p>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="¿Borrar los datos locales de la DEMO?"
        description="Se eliminarán de este navegador la sesión mock, tus reportes y la bitácora simulada. No afecta a nadie más."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => {
                clearDemoStorage();
                window.location.assign('/');
              }}
            >
              Borrar y reiniciar
            </Button>
          </>
        }
      />
    </footer>
  );
}
