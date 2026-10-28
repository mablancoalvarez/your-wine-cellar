import { createHash, randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { jwtVerify, SignJWT } from 'jose';
import { prisma } from './db.js';
import { env } from './env.js';
import { HttpError } from './errors.js';

const accessSecret = new TextEncoder().encode(env.jwtAccessSecret);
const googleClient = new OAuth2Client();

const REFRESH_DAYS = 30;

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export function toPublicUser(user: {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  };
}

export async function ensureCellars(userId: string) {
  const existing = await prisma.cellar.findMany({
    where: { userId, kind: { in: ['default', 'favorites'] } },
    select: { kind: true },
  });
  const kinds = new Set(existing.map((cellar) => cellar.kind));
  const data = [];
  if (!kinds.has('default')) {
    data.push({ userId, name: 'Mi bodega', kind: 'default' });
  }
  if (!kinds.has('favorites')) {
    data.push({ userId, name: 'Favoritos', kind: 'favorites' });
  }
  if (data.length > 0) {
    await prisma.cellar.createMany({ data });
  }
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function issueTokens(userId: string, email: string) {
  const accessToken = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret);

  const refreshToken = randomBytes(32).toString('base64url');
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, accessSecret);
  if (!payload.sub) {
    throw new Error('Token sin usuario');
  }
  return payload.sub;
}

export async function rotateRefreshToken(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!stored || stored.expiresAt.getTime() < Date.now()) {
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
    }
    return null;
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const tokens = await issueTokens(stored.userId, stored.user.email);
  return { ...tokens, user: toPublicUser(stored.user) };
}

export async function revokeRefreshToken(refreshToken: string) {
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: hashToken(refreshToken) },
  });
}

export async function loginWithGoogleCode(input: {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
  clientId?: string;
}) {
  if (!env.googleWebClientId) {
    throw new Error('Falta GOOGLE_CLIENT_IDS en server/.env');
  }

  const clientId =
    input.clientId && env.googleClientIds.includes(input.clientId)
      ? input.clientId
      : env.googleWebClientId;
  const isWebClient = clientId === env.googleWebClientId;
  if (isWebClient && !env.googleClientSecret) {
    throw new Error('Falta GOOGLE_CLIENT_SECRET en server/.env');
  }

  const body = new URLSearchParams({
    code: input.code,
    client_id: clientId,
    redirect_uri: input.redirectUri,
    grant_type: 'authorization_code',
  });
  if (input.codeVerifier) {
    body.set('code_verifier', input.codeVerifier);
  }
  if (isWebClient) {
    body.set('client_secret', env.googleClientSecret);
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const tokens = (await response.json()) as {
    id_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!response.ok || !tokens.id_token) {
    throw new HttpError(
      401,
      tokens.error_description || tokens.error || 'Google rechazó el código',
    );
  }

  return loginWithGoogle(tokens.id_token);
}

export async function loginWithGoogle(idToken: string) {
  if (env.googleClientIds.length === 0) {
    throw new Error('Falta GOOGLE_CLIENT_IDS en server/.env');
  }

  const ticket = await googleClient
    .verifyIdToken({ idToken, audience: env.googleClientIds })
    .catch(() => null);
  const payload = ticket?.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new HttpError(401, 'Token de Google no válido');
  }

  const data = {
    email: payload.email,
    name: payload.name ?? null,
    avatarUrl: payload.picture ?? null,
  };

  let user;
  try {
    user = await prisma.user.upsert({
      where: { googleSub: payload.sub },
      create: { ...data, googleSub: payload.sub },
      update: data,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      user = await prisma.user.update({
        where: { email: payload.email },
        data: { ...data, googleSub: payload.sub },
      });
    } else {
      throw error;
    }
  }

  await ensureCellars(user.id);
  const tokens = await issueTokens(user.id, user.email);
  return { ...tokens, user: toPublicUser(user) };
}
