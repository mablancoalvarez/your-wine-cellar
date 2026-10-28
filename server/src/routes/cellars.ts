import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { findOwnedCellar } from '../ownership.js';
import { requireUser } from '../require-user.js';

const cellarSelect = { id: true, name: true, kind: true } as const;

export async function cellarRoutes(app: FastifyInstance) {
  app.get('/cellars', { preHandler: requireUser }, async (request) => {
    return prisma.cellar.findMany({
      where: { userId: request.userId },
      select: cellarSelect,
      orderBy: { createdAt: 'asc' },
    });
  });

  app.post<{ Body: { name?: string } }>(
    '/cellars',
    { preHandler: requireUser },
    async (request, reply) => {
      const name = request.body?.name?.trim();
      if (!name) {
        return reply.code(400).send({ error: 'Falta el nombre' });
      }

      return prisma.cellar.create({
        data: { userId: request.userId, name, kind: 'custom' },
        select: cellarSelect,
      });
    },
  );

  app.patch<{ Params: { id: string }; Body: { name?: string } }>(
    '/cellars/:id',
    { preHandler: requireUser },
    async (request, reply) => {
      const cellar = await findOwnedCellar(request.userId, request.params.id);
      if (!cellar) {
        return reply.code(404).send({ error: 'Bodega no encontrada' });
      }

      const name = request.body?.name?.trim();
      if (!name) {
        return reply.code(400).send({ error: 'Falta el nombre' });
      }

      return prisma.cellar.update({
        where: { id: cellar.id },
        data: { name },
        select: cellarSelect,
      });
    },
  );

  app.delete<{ Params: { id: string } }>(
    '/cellars/:id',
    { preHandler: requireUser },
    async (request, reply) => {
      const cellar = await findOwnedCellar(request.userId, request.params.id);
      if (!cellar) {
        return reply.code(404).send({ error: 'Bodega no encontrada' });
      }
      if (cellar.kind !== 'custom') {
        return reply.code(400).send({ error: 'Esta bodega no se puede borrar' });
      }

      await prisma.cellar.delete({ where: { id: cellar.id } });
      return reply.code(204).send();
    },
  );
}
