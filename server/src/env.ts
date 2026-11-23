import dotenv from 'dotenv';

dotenv.config({ quiet: true });

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta ${name} en server/.env`);
  }
  return value;
}

function list(name: string) {
  return (process.env[name] ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV?.trim() || 'development';
const jwtAccessSecret = required('JWT_ACCESS_SECRET');
if (nodeEnv === 'production' && jwtAccessSecret.length < 32) {
  throw new Error('JWT_ACCESS_SECRET debe tener al menos 32 caracteres en producción');
}

const googleClientIds = list('GOOGLE_CLIENT_IDS');

export const env = {
  nodeEnv,
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret,
  googleClientIds,
  googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID?.trim() || googleClientIds[0] || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || '',
  googleRedirectUris: list('GOOGLE_REDIRECT_URIS'),
  corsOrigins: list('CORS_ORIGINS'),
  port: Number(process.env.PORT ?? 3000),
};
