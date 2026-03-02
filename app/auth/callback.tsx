import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, Platform, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log(
          '🔍 Callback recibido - Params:',
          JSON.stringify(params, null, 2)
        );
        let code: string | null = null;
        let error: string | null = null;
        let accessTokenFromHash: string | null = null;
        let refreshTokenFromHash: string | null = null;

        // Extraer el código del hash de la URL (web) o de query params
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          // En web, Supabase redirige con el código en el hash
          const hash = window.location.hash.substring(1);
          const hashParams = new URLSearchParams(hash);
          code = hashParams.get('code') || hashParams.get('access_token');
          error = hashParams.get('error');

          // También verificar query params por si acaso
          const urlParams = new URLSearchParams(window.location.search);
          if (!code) code = urlParams.get('code');
          if (!error) error = urlParams.get('error');
        } else {
          // En iOS/Android, Supabase puede devolver:
          // 1. Un código (code) que necesita ser intercambiado
          // 2. Tokens directos (access_token) en el hash del deep link

          code = (params.code as string) || null;
          error = (params.error as string) || null;

          // Si hay un hash pasado como parámetro (caso de access_token en iOS)
          const hash = (params.hash as string) || null;

          if (hash) {
            console.log('🔍 Hash recibido como parámetro, procesando...');
            const hashParams = new URLSearchParams(hash);
            // Extraer code y error del hash
            if (!code) code = hashParams.get('code') || code;
            if (!error) error = hashParams.get('error') || error;

            // Si hay access_token en el hash, extraer todos los tokens
            // Esto es importante para iOS cuando Supabase devuelve tokens directamente
            accessTokenFromHash = hashParams.get('access_token');
            refreshTokenFromHash = hashParams.get('refresh_token');

            if (accessTokenFromHash) {
              console.log(
                '🔍 Access token encontrado en hash - creando sesión manualmente'
              );
            }
          }

          // En iOS, Supabase puede devolver access_token directamente en el hash del deep link
          // Necesitamos obtener la URL del deep link para extraer el hash
          if (!code && !error) {
            try {
              // Primero intentar obtener la URL inicial (cuando la app se abre desde el deep link)
              let deepLinkUrl: string | null = null;

              try {
                deepLinkUrl = await Linking.getInitialURL();
                console.log('🔍 URL inicial del deep link:', deepLinkUrl);
              } catch (e) {
                console.log(
                  '🔍 No se pudo obtener URL inicial (app ya estaba abierta)'
                );
              }

              // Si no hay URL inicial, la app ya estaba abierta
              // En ese caso, expo-router debería haber pasado los parámetros en params
              // Pero también podemos escuchar eventos de deep linking
              if (!deepLinkUrl) {
                // Intentar obtener la URL actual usando Linking
                // Nota: esto puede no funcionar si el deep link ya fue procesado
                console.log(
                  '🔍 Intentando obtener URL del deep link de otra forma...'
                );
              }

              // Si tenemos una URL, parsearla
              if (deepLinkUrl) {
                // Parsear la URL para extraer el hash
                const parsedUrl = Linking.parse(deepLinkUrl);
                console.log('🔍 URL parseada:', parsedUrl);

                // Si hay hash, extraer parámetros del hash
                if (deepLinkUrl.includes('#')) {
                  const hashPart = deepLinkUrl.split('#')[1];
                  const hashParams = new URLSearchParams(hashPart);
                  code = hashParams.get('code') || code;
                  error = hashParams.get('error') || error;

                  // Si hay access_token, Supabase ya procesó la autenticación
                  const accessToken = hashParams.get('access_token');
                  if (accessToken) {
                    console.log(
                      '🔍 Access token encontrado en hash - Supabase debería manejar la sesión automáticamente'
                    );
                  }
                }

                // También verificar query params del parsedUrl
                if (!code && parsedUrl.queryParams) {
                  code = (parsedUrl.queryParams.code as string) || code;
                  error = (parsedUrl.queryParams.error as string) || error;
                }
              }
            } catch (linkingError) {
              console.log(
                '🔍 Error obteniendo URL del deep link:',
                linkingError
              );
            }
          }

          // Si aún no tenemos código, buscar en params de la ruta
          if (!code) {
            const allParams = Object.keys(params);
            console.log('🔍 Todos los parámetros disponibles:', allParams);

            for (const key of allParams) {
              if (key.toLowerCase().includes('code') && !code) {
                code = params[key] as string;
              }
              if (key.toLowerCase().includes('error') && !error) {
                error = params[key] as string;
              }
            }
          }
        }

        if (error) {
          Alert.alert('Error de autenticación', error);
          router.replace('/login');
          return;
        }

        if (code) {
          // Intercambiar el código por una sesión (flujo PKCE)
          console.log('🔍 Intercambiando código por sesión...');
          const { data: sessionData, error: sessionError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (sessionError) {
            throw sessionError;
          }

          if (sessionData.session) {
            // Login exitoso - redirigir a home
            console.log('🔍 Sesión creada exitosamente');
            router.replace('/home');
          } else {
            router.replace('/login');
          }
        } else {
          // Si no hay código, puede ser que tengamos access_token en el hash (iOS)
          // En ese caso, necesitamos crear la sesión manualmente
          if (accessTokenFromHash && refreshTokenFromHash) {
            console.log('🔍 Creando sesión desde access_token del hash...');

            try {
              // Crear la sesión usando los tokens del hash
              // setSession solo necesita access_token y refresh_token
              // El usuario se obtiene automáticamente del access_token
              const { data: sessionData, error: sessionError } =
                await supabase.auth.setSession({
                  access_token: accessTokenFromHash,
                  refresh_token: refreshTokenFromHash,
                });

              if (sessionError) {
                console.error('🔍 Error creando sesión:', sessionError);
                throw sessionError;
              }

              if (sessionData.session) {
                console.log('🔍 Sesión creada exitosamente desde access_token');
                router.replace('/home');
              } else {
                throw new Error('No se pudo crear la sesión');
              }
            } catch (tokenError: any) {
              console.error('🔍 Error procesando tokens del hash:', tokenError);
              // Intentar verificar si ya hay sesión disponible
              const {
                data: { session },
              } = await supabase.auth.getSession();

              if (session) {
                console.log('🔍 Sesión encontrada después del error');
                router.replace('/home');
              } else {
                Alert.alert(
                  'Error',
                  tokenError.message || 'Error al procesar la autenticación'
                );
                router.replace('/login');
              }
            }
          } else {
            // Si no hay access_token, verificar si ya hay sesión disponible
            console.log(
              '🔍 No hay código ni access_token, verificando si hay sesión disponible...'
            );
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (session) {
              console.log('🔍 Sesión encontrada, navegando a home');
              router.replace('/home');
            } else {
              console.error('🔍 No se pudo obtener sesión');
              Alert.alert('Error', 'No se recibió el código de autenticación');
              router.replace('/login');
            }
          }
        }
      } catch (error: any) {
        console.error('Error en callback:', error);
        Alert.alert('Error', error.message || 'Error al procesar el login');
        router.replace('/login');
      }
    };

    handleCallback();
  }, [params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
