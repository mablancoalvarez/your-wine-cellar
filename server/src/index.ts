import cors from '@fastify/cors';
import Fastify from 'fastify';
import './types.js';
import { prisma } from './db.js';
import { env } from './env.js';
import { authRoutes } from './routes/auth.js';
import { cellarRoutes } from './routes/cellars.js';
import { meRoutes } from './routes/me.js';
import { wineRoutes } from './routes/wines.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(authRoutes);
await app.register(cellarRoutes);
await app.register(meRoutes);
await app.register(wineRoutes);

app.get('/health', async () => ({ ok: true }));

async function shutdown(signal: string) {
  app.log.info(`Recibido ${signal}, cerrando…`);
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

try {
  await app.listen({ port: env.port, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
