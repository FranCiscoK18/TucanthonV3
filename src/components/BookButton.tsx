import { CalendarPlus, LogIn } from 'lucide-react';
import { canAccess } from '../app/access';
import { useSession } from '../app/session';
import { ButtonLink } from './ui/Button';

/**
 * Botón «Agendar»: requiere sesión mock de ciudadanía. Sin sesión, lleva al acceso
 * DEMO y regresa al flujo de cita; con otro rol, lo explica sin permitir agendar.
 */
export function BookButton({ doctorId, doctorName, size = 'md' }: { doctorId: string; doctorName: string; size?: 'md' | 'sm' }) {
  const { role } = useSession();
  const target = `/citas/nueva?servicio=${doctorId}`;
  if (canAccess(role, 'citas')) {
    return (
      <ButtonLink to={target} size={size} icon={CalendarPlus}>
        Agendar<span className="sr-only"> con {doctorName}</span>
      </ButtonLink>
    );
  }
  if (role === 'invitado') {
    return (
      <ButtonLink to={`/acceso?siguiente=${encodeURIComponent(target)}&area=citas`} size={size} variant="secondary" icon={LogIn}>
        Agendar (requiere sesión)<span className="sr-only"> con {doctorName}</span>
      </ButtonLink>
    );
  }
  return <p className="text-sm text-muted">Para agendar se necesita una sesión DEMO de ciudadanía.</p>;
}
