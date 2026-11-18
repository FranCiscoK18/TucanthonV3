/**
 * Acceso tolerante a fallos a localStorage (modo privado, cuota llena o
 * almacenamiento bloqueado). Si falla, la DEMO sigue funcionando en memoria.
 */
const memoryFallback = new Map<string, string>();

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key) ?? memoryFallback.get(key) ?? null;
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    const raw = memoryFallback.get(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  const raw = JSON.stringify(value);
  memoryFallback.set(key, raw);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    // Sin persistencia: se conserva solo en memoria durante la sesión.
  }
}

export function removeKey(key: string): void {
  memoryFallback.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignorar
  }
}
