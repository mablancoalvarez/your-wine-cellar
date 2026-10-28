import { GoogleIcon, WineGlassIcon } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/lib/alert';
import { getErrorMessage } from '@/lib/errors';
import {
  backgroundGradient,
  backgroundGradientLocations,
  colors,
  fonts,
} from '@/lib/theme';
import { ResponseType } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

WebBrowser.maybeCompleteAuthSession();

const googleExtra = Constants.expoConfig?.extra as
  | {
      googleWebClientId?: string;
      googleIosClientId?: string;
      googleAndroidClientId?: string;
    }
  | undefined;

function iosRedirectUri(clientId?: string) {
  const suffix = '.apps.googleusercontent.com';
  if (!clientId?.endsWith(suffix)) return undefined;
  return `com.googleusercontent.apps.${clientId.slice(0, -suffix.length)}:/oauthredirect`;
}

const googleClientId =
  Platform.OS === 'ios'
    ? googleExtra?.googleIosClientId
    : Platform.OS === 'android'
      ? googleExtra?.googleAndroidClientId
      : googleExtra?.googleWebClientId;

const platformRedirectUri = Platform.OS === 'ios' ? iosRedirectUri(googleClientId) : undefined;

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signInWithGoogle, user } = useAuth();
  const handledCode = useRef<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      webClientId: googleExtra?.googleWebClientId,
      iosClientId: googleExtra?.googleIosClientId,
      androidClientId: googleExtra?.googleAndroidClientId,
      selectAccount: true,
      responseType: ResponseType.Code,
      shouldAutoExchangeCode: false,
      ...(platformRedirectUri ? { redirectUri: platformRedirectUri } : {}),
    },
    { scheme: 'cellarapp', path: 'login' },
  );

  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [router, user]);

  useEffect(() => {
    if (response?.type === 'error') {
      showAlert('Error', response.error?.message || 'No se pudo iniciar sesión con Google');
      setLoading(false);
      return;
    }

    if (response?.type !== 'success') {
      return;
    }

    const code = response.params.code;
    const redirectUri = request?.redirectUri;
    const codeVerifier = request?.codeVerifier;
    if (!code || !redirectUri || !codeVerifier || !googleClientId) {
      showAlert(
        'Error',
        'No se pudo completar el inicio de sesión con Google. Inténtalo de nuevo.',
      );
      setLoading(false);
      return;
    }
    if (handledCode.current === code) {
      return;
    }

    handledCode.current = code;

    void (async () => {
      try {
        await signInWithGoogle({ code, redirectUri, codeVerifier, clientId: googleClientId });
        // Navigation is handled by the effect watching `user`.
      } catch (error) {
        handledCode.current = null;
        showAlert('Error', getErrorMessage(error, 'No se pudo iniciar sesión con Google'));
        setLoading(false);
      }
    })();
  }, [response, request, signInWithGoogle]);

  const handleGoogleSignIn = async () => {
    if (!request || !googleClientId) {
      showAlert(
        'Error',
        'Falta el Client ID de Google. Revisa CLIENT_ID_WEB, CLIENT_ID_IOS y CLIENT_ID_ANDROID en .env',
      );
      return;
    }

    if (Platform.OS !== 'web' && Constants.executionEnvironment === 'storeClient') {
      showAlert(
        'Simulador',
        'Expo Go no puede completar el login de Google. Usa el development build: npm run simulator.',
      );
      return;
    }

    try {
      setLoading(true);
      const result = await promptAsync();
      if (result.type !== 'success') {
        setLoading(false);
      }
    } catch (error) {
      showAlert('Error', getErrorMessage(error, 'No se pudo iniciar sesión con Google'));
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={backgroundGradient}
        locations={backgroundGradientLocations}
        style={StyleSheet.absoluteFill}
      />

      {/* Warm glow behind the emblem */}
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient
            id="glow"
            cx="50"
            cy="0"
            rx="64"
            ry="44"
            fx="50"
            fy="0"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={colors.burgundy.glow} stopOpacity="1" />
            <Stop offset="0.45" stopColor={colors.burgundy.glow} stopOpacity="0.45" />
            <Stop offset="1" stopColor={colors.burgundy.glow} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#glow)" />
      </Svg>

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <View style={styles.emblem}>
              <View style={styles.emblemFill}>
                <LinearGradient
                  colors={['rgba(124, 36, 56, 0.55)', 'rgba(27, 5, 9, 0.35)']}
                  style={StyleSheet.absoluteFill}
                />
              </View>
              <WineGlassIcon size={48} color={colors.gold.primary} />
            </View>

            <Text style={styles.wordmark}>CELLAR</Text>

            <View style={styles.tagline}>
              <View style={styles.taglineRule} />
              <Text style={styles.taglineText}>COLECCIÓN &amp; CAVA PRIVADA</Text>
              <View style={styles.taglineRule} />
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={styles.heading}>Tu bodega personal,</Text>
            <Text style={[styles.heading, styles.headingAccent]}>
              elevada a su mejor versión.
            </Text>
            <Text style={styles.body}>
              Lleva el registro de tus botellas más preciadas, notas de cata e
              impresiones con total sencillez.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.googleButton, loading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Continuar con Google"
            accessibilityState={{ disabled: loading, busy: loading }}
          >
            {loading ? (
              <ActivityIndicator color={colors.ink} size="small" />
            ) : (
              <>
                <GoogleIcon size={21} />
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.legal}>
            <View style={styles.legalRule} />
            <Text style={styles.legalText}>
              Al acceder, confirmas tu conformidad con las condiciones de uso y
              la política de privacidad de la plataforma.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.burgundy.deep,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingBottom: 8,
  },
  brand: {
    alignItems: 'center',
    marginTop: 40,
  },
  emblem: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(214, 177, 115, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold.line,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  emblemFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    overflow: 'hidden',
  },
  wordmark: {
    marginTop: 22,
    fontFamily: fonts.serifMedium,
    fontSize: 28,
    letterSpacing: 6.5,
    // Offsets the trailing tracking so the text is centered.
    paddingLeft: 6.5,
    color: colors.gold.primary,
  },
  tagline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 11,
  },
  taglineRule: {
    width: 32,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gold.faint,
  },
  taglineText: {
    fontFamily: fonts.display,
    fontSize: 10.5,
    letterSpacing: 2.7,
    paddingLeft: 2.7,
    color: colors.gold.primary,
    opacity: 0.85,
  },
  hero: {
    flex: 1.25,
    justifyContent: 'flex-end',
    paddingBottom: 28,
  },
  heading: {
    fontFamily: fonts.serif,
    fontSize: 27,
    lineHeight: 34,
    color: colors.cream,
    textAlign: 'center',
  },
  headingAccent: {
    fontFamily: fonts.serifItalic,
    color: colors.gold.primary,
  },
  body: {
    marginTop: 26,
    maxWidth: 296,
    alignSelf: 'center',
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.rose.text,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  legal: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 28,
  },
  legalRule: {
    width: 32,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gold.faint,
    marginBottom: 18,
  },
  legalText: {
    maxWidth: 283,
    fontSize: 12,
    lineHeight: 17,
    color: colors.rose.dim,
    textAlign: 'center',
  },
});
