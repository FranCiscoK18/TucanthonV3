import { Compass } from 'lucide-react';
import { ButtonLink } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Página no encontrada');
  return (
    <section className="card card-keylime mx-auto max-w-2xl text-center" aria-labelledby="no-encontrada">
      <Compass className="mx-auto size-9 text-forest-ink" aria-hidden="true" />
      <h1 id="no-encontrada" className="mt-3 text-[2rem]">
        No encontramos esta página
      </h1>
      <p className="mt-3 leading-relaxed">Puede que el enlace haya cambiado. Vuelve al inicio o revisa el mapa.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/">Ir al inicio</ButtonLink>
        <ButtonLink to="/mapa" variant="secondary">
          Ver el mapa
        </ButtonLink>
      </div>
    </section>
  );
}
