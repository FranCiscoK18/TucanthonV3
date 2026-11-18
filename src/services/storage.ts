/**
 * Acceso seguro a `localStorage`. Solo se usan las tres claves permitidas
 * (sesión mock, reportes propios y bitácora). Todo lo leído se valida:
 * si el contenido no tiene la forma esperada, se ignora.
 */
import { STORAGE_KEYS } from '../config/demo';

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function readStored<T>(key: StorageKey, guard: (value: unknown) => value is T): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return guard(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readStoredList<T>(key: StorageKey, guard: (value: unknown) => value is T): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(guard) : [];
  } catch {
    return [];
  }
}

export function writeStored(key: StorageKey, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStored(key: StorageKey): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Sin acceso al almacenamiento: no hay nada que borrar.
  }
}

/** Borra todos los datos locales de la DEMO (las tres claves). */
export function clearDemoStorage(): void {
  Object.values(STORAGE_KEYS).forEach(removeStored);
}
