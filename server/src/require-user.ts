import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from './auth.js';

export async function requireUser(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'No autorizado' });
  }

  try {
    request.userId = await verifyAccessToken(header.slice('Bearer '.length));
  } catch {
    return reply.code(401).send({ error: 'Sesión caducada' });
  }
}
