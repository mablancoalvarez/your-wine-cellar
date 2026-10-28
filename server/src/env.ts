import dotenv from 'dotenv';

dotenv.config({ quiet: true });

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Falta ${name} en server/.env`);
  }
  return value;
}

const googleClientIds = (process.env.GOOGLE_CLIENT_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  googleClientIds,
  googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID?.trim() || googleClientIds[0] || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() || '',
  port: Number(process.env.PORT ?? 3000),
};
