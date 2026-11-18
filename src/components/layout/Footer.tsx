import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-hairline bg-paper">
      <div className="container-page py-8">
        <p className="flex items-start gap-3 rounded-[14px] bg-keylime p-4 text-[14.5px] font-medium text-forest" role="note">
          <ShieldCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
          Ondara complementa, no sustituye, a las autoridades sanitarias. No diagnostica ni confirma casos. Información DEMO para validación.
        </p>
        <div className="mt-6 grid gap-6 text-[13.5px] text-muted md:grid-cols-3">
          <p>
            Un reporte ciudadano es una observación, no un caso clínico confirmado. No se cobra por reportar y la plataforma no ofrece atención clínica.
          </p>
          <p>
            No se publican domicilios ni ubicaciones individuales: solo agregados por zonas amplias. Mapa base © colaboradores de OpenStreetMap.
          </p>
          <nav aria-label="Enlaces del pie de página" className="flex flex-col gap-2">
            <Link className="link" to="/como-funciona">
              Cómo funciona
            </Link>
            <Link className="link" to="/normativa">
              Normativa, fuentes y privacidad
            </Link>
            <Link className="link" to="/acceso">
              Cambiar rol DEMO
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-[12.5px] text-muted">Prototipo frontend DEMO · Tucanthon 2026 · Sin backend ni datos oficiales reales.</p>
      </div>
    </footer>
  );
}
