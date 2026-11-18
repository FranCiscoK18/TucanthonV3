/**
 * Generador pseudoaleatorio con semilla (mulberry32). Permite que los mocks sean
 * deterministas: los mismos datos DEMO en cada carga y en cada navegador.
 */
export interface Rng {
  next(): number;
  int(min: number, max: number): number;
  float(min: number, max: number): number;
  chance(probability: number): boolean;
  pick<T>(items: readonly T[]): T;
  weighted<T>(entries: ReadonlyArray<readonly [T, number]>): T;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };

  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    float: (min, max) => next() * (max - min) + min,
    chance: (probability) => next() < probability,
    pick<T>(items: readonly T[]): T {
      const item = items[Math.floor(next() * items.length)];
      if (item === undefined) throw new Error('pick() sobre una lista vacía');
      return item;
    },
    weighted<T>(entries: ReadonlyArray<readonly [T, number]>): T {
      const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
      let roll = next() * total;
      for (const [value, weight] of entries) {
        roll -= weight;
        if (roll <= 0) return value;
      }
      const last = entries[entries.length - 1];
      if (!last) throw new Error('weighted() sin opciones');
      return last[0];
    },
  };
}

/** Hash FNV-1a de 32 bits: semillas estables a partir de texto. */
export function hashString(text: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Reparte `total` entre pesos con el método del mayor residuo: la suma de
 * los enteros resultantes es exactamente `total`.
 */
export function apportion(total: number, weights: readonly number[]): number[] {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightSum <= 0 || total <= 0) return weights.map(() => 0);
  const raw = weights.map((weight) => (total * weight) / weightSum);
  const floors = raw.map(Math.floor);
  let remainder = total - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  for (const { index } of order) {
    if (remainder <= 0) break;
    floors[index] = (floors[index] ?? 0) + 1;
    remainder -= 1;
  }
  return floors;
}
