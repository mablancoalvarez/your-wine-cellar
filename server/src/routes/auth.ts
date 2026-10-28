import type { FastifyInstance } from 'fastify';
import {
  loginWithGoogleCode,
  revokeRefreshToken,
  rotateRefreshToken,
} from '../auth.js';
import { HttpError } from '../errors.js';

export async function authRoutes(app: FastifyInstance) {
  app.post<{
    Body: { code?: string; redirectUri?: string; codeVerifier?: string; clientId?: string };
  }>('/auth/google', async (request, reply) => {
    const code = request.body?.code?.trim();
    const redirectUri = request.body?.redirectUri?.trim();
    const codeVerifier = request.body?.codeVerifier?.trim();
    const clientId = request.body?.clientId?.trim();
    if (!code || !redirectUri) {
      return reply.code(400).send({ error: 'Faltan code o redirectUri' });
    }

    try {
      return await loginWithGoogleCode({ code, redirectUri, codeVerifier, clientId });
    } catch (error) {
      if (error instanceof HttpError) {
        return reply.code(error.statusCode).send({ error: error.message });
      }
      request.log.error({ err: error }, 'Error inesperado en /auth/google');
      return reply.code(500).send({ error: 'No se pudo iniciar sesión' });
    }
  });

  app.post<{ Body: { refreshToken?: string } }>('/auth/refresh', async (request, reply) => {
    const refreshToken = request.body?.refreshToken?.trim();
    if (!refreshToken) {
      return reply.code(400).send({ error: 'Falta refreshToken' });
    }

    const session = await rotateRefreshToken(refreshToken);
    if (!session) {
      return reply.code(401).send({ error: 'Sesión caducada' });
    }
    return session;
  });

  app.post<{ Body: { refreshToken?: string } }>('/auth/logout', async (request, reply) => {
    const refreshToken = request.body?.refreshToken?.trim();
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    return reply.code(204).send();
  });
}
