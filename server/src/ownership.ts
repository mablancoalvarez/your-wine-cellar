import { prisma } from './db.js';

/** User's cellar, or `null` if it does not exist or does not belong to them. */
export function findOwnedCellar(userId: string, cellarId: string) {
  return prisma.cellar.findFirst({ where: { id: cellarId, userId } });
}

/** User's wine, or `null` if it does not exist or does not belong to them. */
export function findOwnedWine(userId: string, wineId: string) {
  return prisma.wine.findFirst({ where: { id: wineId, userId } });
}
