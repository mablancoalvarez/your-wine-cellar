// Load `server/.env` before Prisma reads `DATABASE_URL`.
import './env.js';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
