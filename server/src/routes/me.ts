import type { FastifyInstance } from 'fastify';
import { toPublicUser } from '../auth.js';
import { prisma } from '../db.js';
import { requireUser } from '../require-user.js';

export async function meRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: requireUser }, async (request, reply) => {
    const user = await prisma.user.findUnique({ where: { id: request.userId } });
    if (!user) {
      return reply.code(401).send({ error: 'No autorizado' });
    }
    return toPublicUser(user);
  });
}
