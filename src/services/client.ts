/**
 * Simulación de llamadas a una API: latencia artificial, fallos opcionales en
 * modo prueba y copia profunda de la respuesta (como si viajara por la red).
 * No se realiza ninguna petición real.
 */
import { getServiceConfig } from './config';

export class DemoServiceError extends Error {
  constructor(message = 'No se pudo completar la solicitud. Vuelve a intentarlo.') {
    super(message);
    this.name = 'DemoServiceError';
  }
}

/** Error de validación con mensajes por campo, para mostrarlos junto a cada control. */
export class ValidationError extends Error {
  readonly fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>, message = 'Revisa los campos marcados.') {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'No encontramos la información solicitada.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

interface RequestOptions {
  /** `false` para operaciones que no deben fallar al azar (p. ej., iniciar sesión mock). */
  failable?: boolean;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function simulateRequest<T>(produce: () => T, options: RequestOptions = {}): Promise<T> {
  const { minLatencyMs, maxLatencyMs, testMode, testModeErrorRate } = getServiceConfig();
  await wait(minLatencyMs + Math.random() * (maxLatencyMs - minLatencyMs));
  if (options.failable !== false && testMode && Math.random() < testModeErrorRate) {
    throw new DemoServiceError();
  }
  return structuredClone(produce());
}
