import { modalityLabels } from '../mocks/activities';
import type { Doctor } from '../types';

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Horario semanal simulado de un servicio del directorio. */
export function ScheduleTable({ doctor }: { doctor: Doctor }) {
  const byDay = [1, 2, 3, 4, 5, 6, 0].map((weekday) => ({
    weekday,
    blocks: doctor.schedule.filter((block) => block.weekday === weekday),
  }));
  return (
    <div className="relative overflow-x-auto rounded-card border border-border-mist" tabIndex={0} aria-label="Horario semanal, desplazable">
      <table className="table-base min-w-[28rem]">
        <caption className="sr-only">Horario semanal de {doctor.name} (DEMO)</caption>
        <thead>
          <tr>
            <th scope="col">Día</th>
            <th scope="col">Horario</th>
            <th scope="col">Modalidad</th>
          </tr>
        </thead>
        <tbody>
          {byDay.map(({ weekday, blocks }) => (
            <tr key={weekday}>
              <th scope="row" className="font-medium">
                {WEEKDAYS[weekday]}
              </th>
              <td className="tabular-nums">
                {blocks.length === 0 ? (
                  <span className="text-muted">Sin atención</span>
                ) : (
                  blocks.map((block) => (
                    <span key={`${block.start}-${block.end}`} className="block">
                      {block.start}–{block.end} h <span className="text-muted">(citas de {block.slotMinutes} min)</span>
                    </span>
                  ))
                )}
              </td>
              <td>
                {blocks.map((block) => (
                  <span key={`${block.start}-${block.end}`} className="block">
                    {block.modalities.map((modality) => modalityLabels[modality]).join(' y ')}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
