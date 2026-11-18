/**
 * Tipos comunes. Todo dato de esta aplicación es simulado (DEMO) y lo declara
 * explícitamente con `isDemo: true`.
 */

/** Fecha de calendario en formato ISO `AAAA-MM-DD`. */
export type ISODate = string;

/** Fecha y hora en formato ISO 8601. */
export type ISODateTime = string;

/** Coordenada `[longitud, latitud]`. Nunca representa a una persona ni un domicilio. */
export type LngLat = readonly [number, number];

/** Marca obligatoria en cada registro simulado. */
export interface DemoRecord {
  readonly isDemo: true;
}

/**
 * Los cuatro tipos de dato que la interfaz distingue con color, icono y etiqueta (regla 8).
 * - `oficial-demo`: simula un registro de una autoridad; NO proviene de ninguna fuente oficial.
 * - `estimado`: indicador calculado a partir de otros datos, con método explicado.
 * - `reporte-ciudadano`: observación enviada por la ciudadanía; no es un caso clínico.
 * - `simulado`: escenario ficticio (agenda, directorio, operación del piloto).
 */
export type DataKind = 'oficial-demo' | 'estimado' | 'reporte-ciudadano' | 'simulado';

/** Semana epidemiológica (domingo a sábado). */
export interface EpiWeek {
  /** Identificador estable, p. ej. `2026-SE45`. */
  id: string;
  year: number;
  week: number;
  start: ISODate;
  end: ISODate;
  /** Etiqueta corta para la UI, p. ej. `SE 45`. */
  label: string;
}

/** Periodos disponibles en los filtros. */
export type PeriodKey = 'ultima' | 'ultimas-4' | 'ultimas-8' | 'ultimas-12';
