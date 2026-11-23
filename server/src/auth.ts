import { createHash, randomBytes, randomUUID } from 'node:crypto';
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

type TokenStore = Prisma.TransactionClient | typeof prisma;

export async function issueTokens(
  userId: string,
  email: string,
  familyId: string = randomUUID(),
  db: TokenStore = prisma,
) {
  const accessToken = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret);

  const refreshToken = randomBytes(32).toString('base64url');
  await db.refreshToken.create({
    data: {
      userId,
      familyId,
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

  return prisma.$transaction(async (tx) => {
    const stored = await tx.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      if (stored) {
        await tx.refreshToken.delete({ where: { id: stored.id } });
      }
      return null;
    }

    // A refresh token already marked used means it was stolen and replayed.
    // Drop the whole family so the attacker’s successor tokens die too.
    if (stored.usedAt) {
      await tx.refreshToken.deleteMany({ where: { familyId: stored.familyId } });
      return null;
    }

    const marked = await tx.refreshToken.updateMany({
      where: { id: stored.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (marked.count !== 1) {
      await tx.refreshToken.deleteMany({ where: { familyId: stored.familyId } });
      return null;
    }

    const tokens = await issueTokens(stored.userId, stored.user.email, stored.familyId, tx);
    return { ...tokens, user: toPublicUser(stored.user) };
  });
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

  if (
    env.googleRedirectUris.length > 0 &&
    !env.googleRedirectUris.includes(input.redirectUri)
  ) {
    throw new HttpError(400, 'redirectUri no permitido');
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

  const emailVerified =
    payload?.email_verified === true || String(payload?.email_verified) === 'true';
  if (!payload?.sub || !payload.email || !emailVerified) {
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
      throw new HttpError(409, 'Ese email ya está vinculado a otra cuenta de Google');
    }
    throw error;
  }

  await ensureCellars(user.id);
  const tokens = await issueTokens(user.id, user.email);
  return { ...tokens, user: toPublicUser(user) };
}
