import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/Feedback';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Página no encontrada');
  return (
    <EmptyState
      icon={Compass}
      title="Página no encontrada"
      description="La dirección no corresponde a ninguna sección de Ondara."
      action={
        <Link to="/" className="btn btn-primary">
          Ir al inicio
        </Link>
      }
    />
  );
}
