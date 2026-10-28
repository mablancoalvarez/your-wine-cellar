# API local y login con Google

La app ya no usa Supabase. En local hay tres procesos: Postgres en Docker, la API en `server/` y Expo.

## 1. Base de datos

En la raíz del repo:

```bash
docker compose up -d
```

Eso crea el contenedor `cellar-postgres` y publica el puerto **5433** del Mac. El contenedor Postgres que ya tengas en el 5432 no se toca.

En pgAdmin: Servers → Register → Server.

- General → Name: `cellar`
- Connection → Host `localhost`, Port `5433`, Maintenance database `cellar`, Username `cellar`, Password `cellar`

## 2. API

```bash
cd server
cp .env.example .env
```

En `server/.env`:

| Variable | Qué es |
|---|---|
| `DATABASE_URL` | Conexión a Postgres (`postgresql://cellar:cellar@localhost:5433/cellar`). |
| `JWT_ACCESS_SECRET` | Secreto para firmar los access tokens. |
| `GOOGLE_CLIENT_IDS` | Los Client ID de Google separados por comas. **El primero debe ser el cliente Web.** |
| `GOOGLE_CLIENT_SECRET` | Client secret del cliente **Web**. Sin él, el login web falla. |
| `PORT` | Puerto de la API (3000 por defecto). |

Opcional: `GOOGLE_WEB_CLIENT_ID` si quieres fijar explícitamente el cliente web aunque no sea el primero de `GOOGLE_CLIENT_IDS`.

```bash
npm install
npx prisma migrate dev
npm run dev
```

La API queda en `http://localhost:3000`. `GET /health` responde `{ "ok": true }`.

> `tsx watch` recarga el código, pero **no** vuelve a leer `server/.env`. Si cambias una variable, reinicia la API.

Para probar vinos sin pasar por Google:

```bash
npm run dev:token
```

Ese comando crea el usuario `dev@cellar.local` y escribe un access token. Con él:

```bash
curl http://localhost:3000/cellars -H "Authorization: Bearer EL_TOKEN"
```

## 3. App

En el `.env` de la raíz:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
CLIENT_ID_WEB=
CLIENT_ID_IOS=
CLIENT_ID_ANDROID=
```

`app.config.js` mete esos Client ID en `extra` y añade el scheme inverso del cliente iOS (necesario para el flujo nativo). Reinicia Expo después de cambiar el `.env`.

```bash
npx expo start
```

### 3.1 Requisitos en macOS

- **Node 22 LTS** (Expo 54 lo exige). Hay un `.nvmrc`:
  ```bash
  nvm install 22
  nvm use 22
  ```
- Para compilar en local hacen falta Xcode, las **Command Line Tools** y **CocoaPods**:
  ```bash
  xcode-select --install
  brew install cocoapods
  ```
  En este Mac ahora mismo faltan las CLT registradas (`pkgutil --pkg-info=com.apple.pkg.CLTools_Executables` no existe), por eso `expo run:ios` falla antes de compilar.

### 3.2 Simulador iOS

Expo Go **no sirve** para el login con Google: Google rechaza las URLs `exp://`. Hace falta un *development build*. Dos opciones:

**A. Build local** (si ya tienes Xcode + CLT + CocoaPods):

```bash
npm run prebuild:ios
npm run ios
```

**B. Build en la nube con EAS** (no necesita CocoaPods, CLT ni cuenta de Apple; solo una cuenta gratis de Expo):

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile simulator --platform ios
npx eas-cli@latest build:run -p ios --profile simulator --latest
```

`build:run` descarga el build y lo instala en el simulador arrancado. También puedes descargar el `.tar.gz` y arrastrar el `.app` al simulador. Después arranca Metro con `npm run start:dev-client`.

> La primera vez EAS te pedirá crear/vincular un proyecto. Como `app.config.js` es dinámico, si no puede escribir el `projectId` automáticamente, añade el valor que te muestre a `extra.eas.projectId` en `app.json`.

### 3.3 iPhone físico

**A. EAS (recomendado cuando tengas cuenta de pago).** Para instalar en un iPhone por enlace/QR hace falta una cuenta de **Apple Developer de pago** (distribución ad hoc). Con un Apple ID gratuito EAS **no** puede firmar para un dispositivo físico; usa la opción B.

```bash
npx eas-cli@latest login
npx eas-cli@latest device:create
npx eas-cli@latest build --profile development --platform ios
```

EAS te da un enlace/QR para instalar el build. Luego `npm run start:dev-client`. Los cambios de JavaScript se recargan en caliente; solo hay que recompilar si cambian dependencias nativas o `app.config.js`.

**B. Gratis con tu Apple ID (build local).** Es la única opción sin pagar. El build caduca a los 7 días:

```bash
xcode-select --install        # una sola vez, instala las Command Line Tools
brew install cocoapods        # una sola vez
npm run prebuild:ios
npm run ios:device
```

Xcode pedirá elegir tu equipo personal (Signing & Capabilities → Team). El iPhone y el Mac deben estar en la misma Wi-Fi. Si Xcode dice que `com.anonymous.cellarapp` no está disponible, cambia `ios.bundleIdentifier` por uno único (por ejemplo `com.tunombre.cellarapp`) y actualiza el Bundle ID del cliente OAuth iOS en Google Cloud.

### 3.4 API desde el iPhone

- La API ya escucha en `0.0.0.0:3000`.
- En desarrollo, `lib/api.ts` detecta la IP del Mac desde Expo y sustituye `localhost` por esa IP. Por eso `EXPO_PUBLIC_API_URL=http://localhost:3000` funciona también en el teléfono.
- El iPhone y el Mac deben estar en la misma red y el firewall de macOS debe permitir Node.
- La primera vez iOS pedirá permiso de **Red local**.
- Si arrancas Expo con `--tunnel`, define `EXPO_PUBLIC_API_URL` con una URL pública: el túnel de Metro no expone el puerto 3000.

### 3.5 Google en iOS

- El cliente OAuth **iOS** debe tener Bundle ID `com.anonymous.cellarapp`.
- `app.config.js` añade el scheme inverso del cliente iOS. Cada vez que cambies ese Client ID hay que regenerar el proyecto nativo con `npm run prebuild:ios` (o dejar que EAS lo haga).
- Si `ios/` está desactualizado, Google redirige pero iOS no devuelve el control a la app.

### 3.6 Uso diario en el simulador

Una vez instalado el development build, **no hay que recompilar** para cambios de JavaScript/TypeScript:

```bash
# 1. Database (if it is not running)
docker compose up -d

# 2. API, in one terminal
cd server && npm run dev

# 3. Metro + open the simulator, in another terminal
cd .. && npm run simulator
```

Si se abre el launcher del dev client en vez de la app, toca el servidor `http://localhost:8081`.

**Solo hay que volver a compilar si:**

- añades o quitas una dependencia nativa,
- cambias `app.json` / `app.config.js` (plugins, permisos, scheme, bundle ID),
- actualizas la versión de Expo/React Native,
- estrenas un simulador o un iPhone donde la app no esté instalada.

En esos casos:

```bash
npx eas-cli@latest build --profile simulator -p ios
npx eas-cli@latest build:run -p ios --profile simulator --latest
```

Los cambios de JS se recargan solos con Fast Refresh; si algo se queda atascado, pulsa `r` en Metro para recargar.

## 4. Google Cloud Console

Crea tres clientes OAuth:

- **Web application**
  - Authorized redirect URI: `http://localhost:8081/login`
  - Su Client ID va primero en `GOOGLE_CLIENT_IDS`.
  - Su Client secret va en `GOOGLE_CLIENT_SECRET`.
- **iOS**
  - Bundle ID: `com.anonymous.cellarapp`
- **Android**
  - Package name: `com.anonymous.cellarapp`
  - SHA-1 del keystore.

Abre la app web en `http://localhost:8081`, no en `http://127.0.0.1:8081`, para que la URI de redirección coincida exactamente con la autorizada.

## 5. Cómo funciona el login

1. La app abre Google con `response_type=code` y PKCE.
2. Google redirige a `http://localhost:8081/login` en web (o al scheme nativo en iOS/Android).
3. La app envía `code`, `redirectUri`, `codeVerifier` y `clientId` a `POST /auth/google`.
4. La API intercambia el código en `https://oauth2.googleapis.com/token`. Si es el cliente web, añade `GOOGLE_CLIENT_SECRET`.
5. La API verifica el `id_token`, crea el usuario si no existe, abre "Mi bodega" y "Favoritos", y devuelve un JWT propio + refresh token.
6. La app guarda la sesión y entra en `/home`.

## 6. Problemas frecuentes

- **`Falta GOOGLE_CLIENT_SECRET en server/.env`**
  Rellena el secret del cliente Web y reinicia la API.

- **`redirect_uri_mismatch`**
  La URI de redirección no está autorizada en el cliente correcto. En web debe ser exactamente `http://localhost:8081/login`.

- **`invalid_client`**
  El secret no pertenece al Client ID Web que se está usando.

- **`Malformed auth code` / `invalid_grant`**
  El código ya se usó, caducó o el `redirectUri`/`codeVerifier` no coinciden con los del paso 1.

- **Expo Go no completa el login nativo**
  Google rechaza las URLs `exp://`. Usa un development build: `npm run ios` en local o `npx eas-cli@latest build --profile simulator --platform ios` (ver sección 3.2).

- **La app arranca pero Google no vuelve a la app en iOS**
  Falta el scheme inverso en `Info.plist`. Ejecuta `npm run prebuild:ios` y vuelve a compilar. Comprueba que el Bundle ID del cliente OAuth iOS sea `com.anonymous.cellarapp`.

- **En el iPhone no cargan los vinos / error de red**
  El móvil no llega al Mac. Comprueba que estén en la misma Wi-Fi, que la API escuche en `0.0.0.0:3000` y que macOS permita Node en el firewall. Si usas túnel, configura `EXPO_PUBLIC_API_URL` con una URL pública.

## Qué guarda la base

- `users`
- `cellars` (Mi bodega, Favoritos, y más adelante listas propias)
- `wines`
- `cellar_wines` (un vino puede estar en varias listas)
- `refresh_tokens`
