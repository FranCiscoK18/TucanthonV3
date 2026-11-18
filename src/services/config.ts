/**
 * ÚNICO punto de configuración de los servicios simulados: latencia artificial y
 * tasa de error. En «modo prueba» las llamadas fallan al azar para revisar los
 * estados de error de la interfaz. Se activa desde el pie de página o con `?modo-prueba=1`.
 */
export interface ServiceConfig {
  /** Latencia mínima simulada en milisegundos. */
  minLatencyMs: number;
  /** Latencia máxima simulada en milisegundos. */
  maxLatencyMs: number;
  /** Probabilidad de fallo (0–1) cuando el modo prueba está activo. */
  testModeErrorRate: number;
  /** Modo prueba activo. Vive solo en memoria: se reinicia al recargar. */
  testMode: boolean;
}

const config: ServiceConfig = {
  minLatencyMs: 300,
  maxLatencyMs: 800,
  testModeErrorRate: 0.35,
  testMode: false,
};

type Listener = (config: Readonly<ServiceConfig>) => void;
const listeners = new Set<Listener>();

export function getServiceConfig(): Readonly<ServiceConfig> {
  return config;
}

export function setTestMode(enabled: boolean): void {
  config.testMode = enabled;
  listeners.forEach((listener) => listener(config));
}

export function subscribeServiceConfig(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Lee `?modo-prueba=1` al iniciar la aplicación. */
export function initServiceConfigFromUrl(search: string): void {
  const params = new URLSearchParams(search);
  if (params.get('modo-prueba') === '1') setTestMode(true);
}
