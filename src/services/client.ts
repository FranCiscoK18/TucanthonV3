import { demoConfig } from '../config/demo';

/** Error controlado de un servicio simulado. */
export class DemoServiceError extends Error {
  constructor(message = 'El servicio DEMO no respondió (fallo simulado). Intenta de nuevo.') {
    super(message);
    this.name = 'DemoServiceError';
  }
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Envuelve una operación síncrona con latencia artificial y fallo aleatorio
 * según `demoConfig`. Devuelve una copia estructurada para evitar que la UI
 * mute los mocks por referencia.
 */
export async function simulate<T>(operation: () => T): Promise<T> {
  const { min, max } = demoConfig.latencyMs;
  await wait(min + Math.random() * (max - min));
  if (Math.random() < demoConfig.errorRate) {
    throw new DemoServiceError();
  }
  return structuredClone(operation());
}
