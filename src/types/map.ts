import type { DiseaseCategory, RegionId } from './epidemiology';
import type { PeriodKey } from './common';
import type { HealthActivity } from './services';

/** Seis capas del mapa, siempre separadas y con leyenda propia. */
export type MapLayerId = 'oficial' | 'estimado' | 'reportes' | 'observaciones' | 'brigadas' | 'vectorial';

export interface MapFilters {
  diseaseId: string | 'todas';
  category: DiseaseCategory | 'todas';
  period: PeriodKey;
  regionId: RegionId | 'todas';
}

/** Conteo publicado con supresión de valores pequeños (p. ej. `<3`). */
export interface PublishedCount {
  value: number;
  display: string;
  suppressed: boolean;
}

export interface ZoneLayerValues {
  regionId: RegionId;
  oficial: { count: number; bin: number };
  estimado: { ratePer10k: number; population: number };
  reportes: PublishedCount;
  observaciones: PublishedCount;
  vectorial: { positivityPct: number; trapsInspected: number; aboveThreshold: boolean } | null;
}

export interface MapDataset {
  periodLabel: string;
  officialCutoff: string;
  participationUpdatedAt: string;
  diseaseLabel: string;
  zones: ZoneLayerValues[];
  activities: HealthActivity[];
  /** Límites superiores de las clases 1–5 de la capa oficial (la clase 0 es «sin registros»). */
  officialBreaks: number[];
  vectorAvailable: boolean;
}
