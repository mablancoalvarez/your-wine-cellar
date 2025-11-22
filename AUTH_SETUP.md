# Configuración de Autenticación con Google y Supabase

Este proyecto está configurado para usar autenticación con Google OAuth a través de Supabase.

## Pasos de Configuración

### 1. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com) si no tienes una.
2. Crea un nuevo proyecto.
3. Ve a **Settings** > **API** y copia:
   - **Project URL** (tu URL de Supabase)
   - **anon/public key** (tu clave anónima)

### 2. Configurar Google OAuth en Supabase

1. En tu proyecto de Supabase, ve a **Authentication** > **Providers**.
2. Habilita el proveedor **Google**.
3. Necesitarás crear un proyecto en [Google Cloud Console](https://console.cloud.google.com):
   - Crea un nuevo proyecto o selecciona uno existente.
   - Ve a **APIs & Services** > **Credentials**.
   - Crea credenciales OAuth 2.0 (tipo "Web application").
   - Agrega las siguientes URLs de redirección autorizadas:
     - Para desarrollo: `exp://localhost:8081`
     - Para producción: `tu-scheme://auth/callback` (ejemplo: `cellarapp://auth/callback`)
   - Copia el **Client ID** y **Client Secret**.
4. Pega el Client ID y Client Secret en la configuración de Google en Supabase.

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

**Nota:** Las variables que empiezan con `EXPO_PUBLIC_` son accesibles en el cliente.

### 4. Configurar el Scheme en app.json

El `scheme` ya está configurado como `cellarapp` en `app.json`. Este scheme se usa para el callback de OAuth.

### 5. Ejecutar el Proyecto

```bash
npm install
npx expo start
```

## Estructura del Proyecto

- `lib/supabase.ts` - Cliente de Supabase configurado
- `contexts/AuthContext.tsx` - Contexto de autenticación que maneja el estado de sesión
- `app/login.tsx` - Pantalla de login con botón de Google
- `app/home.tsx` - Pantalla protegida que muestra información del usuario
- `app/index.tsx` - Pantalla de redirección que verifica el estado de autenticación

## Flujo de Autenticación

1. El usuario abre la app y es redirigido a `/login` si no está autenticado.
2. Al presionar "Continuar con Google", se abre el navegador para autenticación.
3. Después de autenticarse, Google redirige de vuelta a la app con un código.
4. El código se intercambia por una sesión de Supabase.
5. El usuario es redirigido a `/home` donde puede ver su información.

## Uso del Contexto de Autenticación

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, session, loading, signOut } = useAuth();

  if (loading) return <ActivityIndicator />;
  if (!user) return <Text>No autenticado</Text>;

  return <Text>Hola {user.email}</Text>;
}
```

## Solución de Problemas

### Error: "Falta la configuración de Supabase"

- Asegúrate de que el archivo `.env` existe y tiene las variables correctas.
- Reinicia el servidor de Expo después de crear/modificar `.env`.

### Error al iniciar sesión con Google

- Verifica que las URLs de redirección en Google Cloud Console coincidan con el scheme de tu app.
- Asegúrate de que Google OAuth está habilitado en Supabase.
- Verifica que el Client ID y Client Secret son correctos.

### La sesión no persiste

- Verifica que `AsyncStorage` está funcionando correctamente.
- En desarrollo, puedes limpiar el almacenamiento con `AsyncStorage.clear()`.
