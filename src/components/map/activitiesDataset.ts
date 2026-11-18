/** Conjunto mínimo para mapas que solo muestran brigadas y campañas. */
import { regions } from '../../mocks/regions';
import type { HealthActivity, MapDataset, MapLayerId } from '../../types';

export const ONLY_BRIGADES: Record<MapLayerId, boolean> = {
  oficial: false,
  estimado: false,
  reportes: false,
  observaciones: false,
  brigadas: true,
  vectorial: false,
};

export function activitiesDataset(activities: HealthActivity[]): MapDataset {
  return {
    periodLabel: 'Próximos 14 días',
    officialCutoff: '',
    participationUpdatedAt: '',
    diseaseLabel: 'Brigadas y campañas',
    zones: regions.map((region) => ({
      regionId: region.id,
      oficial: { count: 0, bin: 0 },
      estimado: { ratePer10k: 0, population: region.populationEstimate },
      reportes: { value: 0, display: '0', suppressed: false },
      observaciones: { value: 0, display: '0', suppressed: false },
      vectorial: null,
    })),
    activities,
    officialBreaks: [],
    vectorAvailable: false,
  };
}
