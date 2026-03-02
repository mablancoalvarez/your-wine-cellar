import { MaterialIcons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

// Necesario para que funcione correctamente el flujo de autenticación
if (Platform.OS !== 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Error',
        'Supabase no está configurado. Verifica tu archivo .env'
      );
      return;
    }

    try {
      setLoading(true);

      const scheme = Array.isArray(Constants.expoConfig?.scheme)
        ? Constants.expoConfig.scheme[0]
        : Constants.expoConfig?.scheme || 'cellarapp';

      // Configurar el redirect URI
      const redirectTo =
        Platform.OS === 'web'
          ? AuthSession.makeRedirectUri({
              scheme,
              path: 'auth/callback',
            })
          : `${scheme}://auth/callback`;

      console.log('redirect', redirectTo);
      // Obtener la URL de autenticación de Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        if (Platform.OS === 'web') {
          // En web, redirigir directamente a la URL de Google
          // El callback será manejado por la ruta /auth/callback
          if (typeof window !== 'undefined') {
            window.location.href = data.url;
          }
        } else {
          // En iOS/Android, abrir el navegador para autenticación
          console.log('🔍 Abriendo WebBrowser con URL:', data.url);
          console.log('🔍 RedirectTo:', redirectTo);
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectTo
          );

          console.log('🔍 Resultado de WebBrowser:', result.type);

          if (result.type === 'success') {
            console.log('🔍 URL completa recibida:', result.url);

            // En iOS, Supabase puede devolver tokens directamente en el hash (access_token)
            // o un código que necesita ser intercambiado. Navegamos a /auth/callback
            // y dejamos que esa ruta maneje ambos casos (igual que en web)

            // Verificar si hay error en la URL
            const urlString = result.url;
            const errorMatch = urlString.match(/[?&#]error=([^&#]+)/);

            if (errorMatch) {
              const error = decodeURIComponent(errorMatch[1]);
              Alert.alert('Error de autenticación', error);
              setLoading(false);
              return;
            }

            // Verificar si hay access_token (tokens directos) o code (código a intercambiar)
            const hasAccessToken = urlString.includes('access_token=');
            const hasCode = urlString.includes('code=');

            console.log('🔍 Has access_token:', hasAccessToken);
            console.log('🔍 Has code:', hasCode);

            if (hasAccessToken || hasCode) {
              // Navegar a /auth/callback - esa ruta manejará el procesamiento
              console.log(
                '🔍 Tokens o código encontrados, navegando a /auth/callback'
              );

              // Si hay código, pasarlo como parámetro
              if (hasCode) {
                const codeMatch = urlString.match(/[?&#]code=([^&#]+)/);
                if (codeMatch) {
                  const code = decodeURIComponent(codeMatch[1]);
                  router.replace({
                    pathname: '/auth/callback',
                    params: { code },
                  });
                } else {
                  router.replace('/auth/callback');
                }
              } else if (hasAccessToken) {
                // Si hay access_token, extraer el hash completo y pasarlo al callback
                // El hash contiene todos los tokens necesarios
                const hashMatch = urlString.match(/#(.+)/);
                if (hashMatch) {
                  const hash = hashMatch[1];
                  console.log('🔍 Hash extraído, pasando al callback');
                  // Pasar el hash completo como parámetro
                  router.replace({
                    pathname: '/auth/callback',
                    params: { hash },
                  });
                } else {
                  // Si no podemos extraer el hash, simplemente navegar
                  router.replace('/auth/callback');
                }
              }
            } else {
              console.error(
                '🔍 No se encontró ni código ni access_token en la URL'
              );
              console.error('🔍 URL completa:', result.url);
              Alert.alert(
                'Error',
                'No se recibió la respuesta de autenticación. Por favor, intenta de nuevo.'
              );
              setLoading(false);
            }
          } else if (result.type === 'cancel') {
            console.log('🔍 Usuario canceló el login');
            setLoading(false);
          } else if (result.type === 'dismiss') {
            console.log('🔍 Usuario cerró el navegador');
            setLoading(false);
          } else {
            console.log('🔍 Resultado inesperado:', result.type);
            setLoading(false);
          }
        }
      }
    } catch (error: any) {
      console.error('Error en Google Sign In:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo iniciar sesión con Google'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo/Icono de la app */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="wine-bar" size={64} color="#8B4513" />
          </View>
        </View>

        {/* Título y subtítulo */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Bienvenido a Cellar! Welcome</Text>
          <Text style={styles.subtitle}>
            Inicia sesión para comenzar a gestionar tu bodega
          </Text>
        </View>

        {/* Botón de Google */}
        <TouchableOpacity
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#4285F4" size="small" />
          ) : (
            <>
              <View style={styles.googleIconContainer}>
                <View style={styles.googleIcon}>
                  <View style={styles.googleIconInner}>
                    <View style={[styles.googleColor, styles.googleBlue]} />
                    <View style={[styles.googleColor, styles.googleRed]} />
                    <View style={[styles.googleColor, styles.googleYellow]} />
                    <View style={[styles.googleColor, styles.googleGreen]} />
                  </View>
                </View>
              </View>
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Texto de términos */}
        <Text style={styles.termsText}>
          Al continuar, aceptas nuestros términos de servicio y política de
          privacidad
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  logoContainer: {
    marginBottom: 48,
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#DADCE0',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  googleIconInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  googleColor: {
    position: 'absolute',
    width: '50%',
    height: '50%',
  },
  googleBlue: {
    top: 0,
    left: 0,
    backgroundColor: '#4285F4',
    borderTopLeftRadius: 2,
  },
  googleRed: {
    top: 0,
    right: 0,
    backgroundColor: '#EA4335',
    borderTopRightRadius: 2,
  },
  googleYellow: {
    bottom: 0,
    left: 0,
    backgroundColor: '#FBBC04',
    borderBottomLeftRadius: 2,
  },
  googleGreen: {
    bottom: 0,
    right: 0,
    backgroundColor: '#34A853',
    borderBottomRightRadius: 2,
  },
  googleButtonText: {
    color: '#3C4043',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  termsText: {
    marginTop: 32,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
  },
});
