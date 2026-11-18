import { Scale } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DataKindBadge } from '../components/ui/Badges';
import { Notice } from '../components/ui/Feedback';
import { PageHeader, Section } from '../components/ui/Layout';
import type { DataKind } from '../config/dataKinds';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { regulations } from '../mocks/institutional';
import { dataSources } from '../mocks/sources';
import type { DataSourceType } from '../types';
import { formatDate } from '../utils/dates';

const SOURCE_KIND: Record<DataSourceType, DataKind> = {
  'oficial-demo': 'oficial',
  estimado: 'estimado',
  ciudadano: 'ciudadano',
  'entomologico-demo': 'vector',
  'campanas-demo': 'brigada',
  'directorio-demo': 'simulado',
};

export default function Regulations() {
  useDocumentTitle('Normativa y fuentes');
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) {
      el.scrollIntoView({ block: 'start' });
      el.focus({ preventScroll: true });
    }
  }, [hash]);

  return (
    <>
      <PageHeader
        eyebrow="Marco de referencia"
        title="Normativa y fuentes"
        description="Marcos que deben revisarse antes de operar un piloto, y procedencia de cada conjunto de datos de la demo."
      />
      <Notice tone="caution" title="Aviso">
        Este apartado no sustituye un dictamen jurídico ni autoriza recopilar datos sensibles.
      </Notice>

      <Section id="marcos" eyebrow="Normativa" title="Marcos a revisar">
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">Marcos normativos a revisar</caption>
            <thead>
              <tr>
                <th scope="col">Marco</th>
                <th scope="col">Ámbito</th>
                <th scope="col">Por qué importa</th>
                <th scope="col">Pendiente de revisión</th>
              </tr>
            </thead>
            <tbody>
              {regulations.map((r) => (
                <tr key={r.id}>
                  <th scope="row" className="min-w-[220px] !bg-transparent font-medium">
                    <span className="flex gap-2">
                      <Scale aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                      {r.name}
                    </span>
                  </th>
                  <td>{r.scope}</td>
                  <td className="min-w-[220px]">{r.relevance}</td>
                  <td className="min-w-[220px]">{r.pendingReview}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[13px] text-muted">Las versiones y fechas deben confirmarse en publicaciones oficiales vigentes.</p>
      </Section>

      <Section id="privacidad" eyebrow="Privacidad" title="Principios de privacidad de la demo">
        <ul className="grid gap-3 md:grid-cols-2">
          {[
            'Minimización: los reportes no piden nombre, teléfono, correo ni domicilio.',
            'Agregación: solo se publican conteos por zonas amplias; los conteos menores a 3 se ocultan.',
            'Separación de módulos: información pública (A) y participación y reportes (B).',
            'Sin datos sensibles de salud identificables: la demo no los recopila ni los almacena.',
          ].map((t) => (
            <li key={t} className="panel-keylime text-[15px]">
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="fuentes" eyebrow="Fuentes" title="Procedencia de los datos DEMO">
        <ul className="space-y-3">
          {dataSources.map((s) => (
            <li key={s.id} id={`fuente-${s.id}`} tabIndex={-1} className="card scroll-mt-24 outline-none focus:ring-[3px] focus:ring-sage">
              <div className="flex flex-wrap items-center gap-2">
                <DataKindBadge kind={SOURCE_KIND[s.type]} />
                <span className="pill bg-paper text-muted">Corte: {formatDate(s.cutoffDate)}</span>
              </div>
              <h3 className="mt-2 text-[17px] font-semibold text-forest">{s.name}</h3>
              <dl className="mt-2 grid gap-x-6 gap-y-1 text-[14px] md:grid-cols-2">
                <div>
                  <dt className="inline font-semibold">Responsable: </dt>
                  <dd className="inline text-muted">{s.responsible}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Periodo: </dt>
                  <dd className="inline text-muted">{s.period}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">Cobertura: </dt>
                  <dd className="inline text-muted">{s.coverage}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="inline font-semibold">Limitaciones: </dt>
                  <dd className="inline">{s.limitations}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
