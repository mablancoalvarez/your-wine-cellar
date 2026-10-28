import type { Wine } from './api';

export type WineFilterKind = 'country' | 'grape';

export type WineFilters = {
  query: string;
  country?: string;
  grape?: string;
};

/** Unique, sorted values available for a filter. */
export function getFilterOptions(wines: Wine[], kind: WineFilterKind): string[] {
  const values = wines.map((wine) => wine[kind]).filter(Boolean);
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'es'));
}

/**
 * Client-side filtering. The API already supports `q`, `country` and `grape`;
 * this stays here while the number of wines per cellar is small (see ADR D7).
 */
export function filterWines(wines: Wine[], { query, country, grape }: WineFilters): Wine[] {
  const normalizedQuery = query.trim().toLowerCase();

  return wines.filter((wine) => {
    const matchesQuery =
      !normalizedQuery ||
      wine.name.toLowerCase().includes(normalizedQuery) ||
      wine.winery.toLowerCase().includes(normalizedQuery);
    const matchesCountry = !country || wine.country === country;
    const matchesGrape = !grape || wine.grape === grape;

    return matchesQuery && matchesCountry && matchesGrape;
  });
}
