import type { Cellar } from './api';

/** Cellar used by default: the one marked `default` or, if missing, the first one. */
export function findDefaultCellar(cellars: Cellar[]): Cellar | undefined {
  return cellars.find((cellar) => cellar.kind === 'default') ?? cellars[0];
}
