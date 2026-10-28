import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { findOwnedCellar, findOwnedWine } from '../ownership.js';
import { requireUser } from '../require-user.js';

type WineBody = {
  name?: string;
  winery?: string;
  country?: string;
  grape?: string;
  year?: number;
  rating?: number;
  notes?: string;
  vintage?: string;
};

const wineSelect = {
  id: true,
  name: true,
  winery: true,
  country: true,
  year: true,
  grape: true,
  rating: true,
  notes: true,
  vintage: true,
  createdAt: true,
} as const;

function readWineBody(body: WineBody) {
  const name = body.name?.trim() ?? '';
  const winery = body.winery?.trim() ?? '';
  const country = body.country?.trim() ?? '';
  const grape = body.grape?.trim() ?? '';
  const year = Number(body.year);
  const rating = Number(body.rating ?? 0);
  const notes = body.notes?.trim() ?? '';
  const vintage = body.vintage?.trim() ?? '';

  if (!name || !winery || !country || !grape) {
    return { error: 'Nombre, bodega, país y uva son obligatorios' };
  }
  if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1) {
    return { error: 'Año no válido' };
  }

  if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
    return { error: 'La valoración va de 0 a 5' };
  }

  return { data: { name, winery, country, grape, year, rating, notes, vintage } };
}

export async function wineRoutes(app: FastifyInstance) {
  app.get<{
    Params: { cellarId: string };
    Querystring: { q?: string; country?: string; grape?: string };
  }>('/cellars/:cellarId/wines', { preHandler: requireUser }, async (request, reply) => {
    const cellar = await findOwnedCellar(request.userId, request.params.cellarId);
    if (!cellar) {
      return reply.code(404).send({ error: 'Bodega no encontrada' });
    }

    const q = request.query.q?.trim();
    const country = request.query.country?.trim();
    const grape = request.query.grape?.trim();

    return prisma.wine.findMany({
      where: {
        userId: request.userId,
        cellars: { some: { cellarId: cellar.id } },
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { winery: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(country ? { country: { equals: country, mode: 'insensitive' } } : {}),
        ...(grape ? { grape: { equals: grape, mode: 'insensitive' } } : {}),
      },
      select: wineSelect,
      orderBy: { createdAt: 'desc' },
    });
  });

  app.post<{ Params: { cellarId: string }; Body: WineBody }>(
    '/cellars/:cellarId/wines',
    { preHandler: requireUser },
    async (request, reply) => {
      const cellar = await findOwnedCellar(request.userId, request.params.cellarId);
      if (!cellar) {
        return reply.code(404).send({ error: 'Bodega no encontrada' });
      }

      const parsed = readWineBody(request.body ?? {});
      if ('error' in parsed) {
        return reply.code(400).send({ error: parsed.error });
      }

      return prisma.$transaction(async (tx) => {
        const wine = await tx.wine.create({
          data: { ...parsed.data, userId: request.userId },
          select: wineSelect,
        });
        await tx.cellarWine.create({
          data: { cellarId: cellar.id, wineId: wine.id },
        });
        return wine;
      });
    },
  );

  app.get<{ Params: { id: string } }>(
    '/wines/:id',
    { preHandler: requireUser },
    async (request, reply) => {
      const wine = await prisma.wine.findFirst({
        where: { id: request.params.id, userId: request.userId },
        select: {
          ...wineSelect,
          cellars: { select: { cellarId: true } },
        },
      });
      if (!wine) {
        return reply.code(404).send({ error: 'Vino no encontrado' });
      }
      return wine;
    },
  );

  app.patch<{ Params: { id: string }; Body: WineBody }>(
    '/wines/:id',
    { preHandler: requireUser },
    async (request, reply) => {
      const wine = await findOwnedWine(request.userId, request.params.id);
      if (!wine) {
        return reply.code(404).send({ error: 'Vino no encontrado' });
      }

      const parsed = readWineBody(request.body ?? {});
      if ('error' in parsed) {
        return reply.code(400).send({ error: parsed.error });
      }

      return prisma.wine.update({
        where: { id: wine.id },
        data: parsed.data,
        select: wineSelect,
      });
    },
  );

  app.delete<{ Params: { id: string } }>(
    '/wines/:id',
    { preHandler: requireUser },
    async (request, reply) => {
      const wine = await findOwnedWine(request.userId, request.params.id);
      if (!wine) {
        return reply.code(404).send({ error: 'Vino no encontrado' });
      }
      await prisma.wine.delete({ where: { id: wine.id } });
      return reply.code(204).send();
    },
  );

  app.post<{ Params: { id: string; cellarId: string } }>(
    '/wines/:id/lists/:cellarId',
    { preHandler: requireUser },
    async (request, reply) => {
      const wine = await findOwnedWine(request.userId, request.params.id);
      const cellar = await findOwnedCellar(request.userId, request.params.cellarId);
      if (!wine || !cellar) {
        return reply.code(404).send({ error: 'Vino o bodega no encontrados' });
      }

      await prisma.cellarWine.upsert({
        where: { cellarId_wineId: { cellarId: cellar.id, wineId: wine.id } },
        create: { cellarId: cellar.id, wineId: wine.id },
        update: {},
      });
      return reply.code(204).send();
    },
  );

  app.delete<{ Params: { id: string; cellarId: string } }>(
    '/wines/:id/lists/:cellarId',
    { preHandler: requireUser },
    async (request, reply) => {
      const wine = await findOwnedWine(request.userId, request.params.id);
      const cellar = await findOwnedCellar(request.userId, request.params.cellarId);
      if (!wine || !cellar) {
        return reply.code(404).send({ error: 'Vino o bodega no encontrados' });
      }

      await prisma.cellarWine.deleteMany({
        where: { cellarId: cellar.id, wineId: wine.id },
      });
      return reply.code(204).send();
    },
  );
}
