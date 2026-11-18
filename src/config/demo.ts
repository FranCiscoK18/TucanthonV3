/**
 * ÚNICO punto de configuración de los servicios simulados (DEMO).
 *
 * - `latencyMs`: latencia artificial de cada llamada.
 * - `errorRate`: probabilidad (0–1) de que una llamada falle a propósito para
 *   probar estados de error. Por defecto 0.
 *
 * Formas de activar el "modo prueba" de errores:
 *   1. Variable de entorno: `VITE_DEMO_ERROR_RATE=0.3 npm run dev`
 *   2. Parámetro de URL: `?modoPrueba=1` (tasa 0.3)
 *   3. Interruptor en Administración → Configuración (solo en memoria).
 */
export interface DemoConfig {
  latencyMs: { min: number; max: number };
  errorRate: number;
}

const TEST_MODE_ERROR_RATE = 0.3;

function initialErrorRate(): number {
  const fromEnv = Number(import.meta.env.VITE_DEMO_ERROR_RATE ?? '0');
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('modoPrueba') === '1') {
    return TEST_MODE_ERROR_RATE;
  }
  return Number.isFinite(fromEnv) ? Math.min(1, Math.max(0, fromEnv)) : 0;
}

export const demoConfig: DemoConfig = {
  latencyMs: { min: 300, max: 800 },
  errorRate: initialErrorRate(),
};

export function setTestMode(enabled: boolean): void {
  demoConfig.errorRate = enabled ? TEST_MODE_ERROR_RATE : 0;
}

export function isTestMode(): boolean {
  return demoConfig.errorRate > 0;
}

/** Claves de localStorage permitidas (y únicas) en la DEMO. */
export const STORAGE_KEYS = {
  session: 'ondara-demo:sesion',
  reports: 'ondara-demo:reportes-propios',
  auditLog: 'ondara-demo:bitacora',
} as const;
