# Cellar

Aplicación Expo (iOS, Android y web) para gestionar una bodega personal de vinos,
con API propia (Fastify + Prisma + Postgres) y login con Google.

```
App Expo ──► API Fastify ──► Postgres (Docker)
      │
      └──► Google Identity (solo para validar identidad)
```

## Requisitos

- Node.js (ver `.nvmrc`)
- Docker
- Xcode para el simulador de iOS

## Puesta en marcha

### 1. Base de datos

```bash
docker compose up -d
```

Postgres queda publicado en `localhost:5433` (usuario, contraseña y base: `cellar`).

### 2. API

```bash
cd server
cp .env.example .env   # rellena JWT_ACCESS_SECRET y GOOGLE_CLIENT_IDS
npm install
npx prisma migrate dev
npm run dev
```

Comprobación: `curl http://localhost:3000/health` → `{"ok":true}`.

Para probar la API sin Google:

```bash
cd server && npm run dev:token
```

### 3. App

```bash
cp .env.example .env   # URL de la API y Client IDs de Google
npm install
npm run simulator      # development build en el simulador de iOS
```

> El login con Google no funciona en Expo Go: usa un development build
> (`npm run simulator` o `npm run start:dev-client`).

## Estructura

| Ruta | Contenido |
|---|---|
| `app/` | Rutas de expo-router (`login`, `home`, `add-wine`) |
| `components/` | Componentes de UI reutilizables |
| `contexts/` | Estado global de autenticación |
| `hooks/` | Hooks de datos de la app |
| `lib/` | Cliente HTTP, tema, filtros y utilidades |
| `server/` | API Fastify + Prisma |
| `docker-compose.yml` | Postgres local |

## Comandos útiles

```bash
npm run lint            # ESLint (app)
npx tsc --noEmit        # Typecheck (app)
cd server && npm run typecheck
```

La configuración detallada de Google OAuth, EAS y builds de iOS está en
[`AUTH_SETUP.md`](./AUTH_SETUP.md).

## Variables de entorno

- Raíz (`.env`): `EXPO_PUBLIC_API_URL`, `CLIENT_ID_WEB`, `CLIENT_ID_IOS`,
  `CLIENT_ID_ANDROID`.
- Servidor (`server/.env`): `DATABASE_URL`, `JWT_ACCESS_SECRET`,
  `GOOGLE_CLIENT_IDS`, `GOOGLE_CLIENT_SECRET`, `PORT`.

Los Client ID de Google son públicos; `app.json` los incluye como fallback para
los builds de EAS, que no suben el archivo `.env`.
