import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// import { supabase } from '../lib/supabase';

// Necesario para que funcione correctamente el flujo de autenticación
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    Alert.alert('Info', 'Configura Supabase primero para habilitar el login');
    // try {
    //   setLoading(true);

    //   // Configurar el proveedor de Google OAuth
    //   const redirectTo = AuthSession.makeRedirectUri({
    //     scheme: Constants.expoConfig?.scheme || 'cellarapp',
    //     path: 'auth/callback',
    //   });

    //   // Obtener la URL de autenticación de Supabase
    //   const { data, error } = await supabase.auth.signInWithOAuth({
    //     provider: 'google',
    //     options: {
    //       redirectTo,
    //       queryParams: {
    //         access_type: 'offline',
    //         prompt: 'consent',
    //       },
    //     },
    //   });

    //   if (error) throw error;

    //   if (data?.url) {
    //     // Abrir el navegador para autenticación
    //     const result = await WebBrowser.openAuthSessionAsync(
    //       data.url,
    //       redirectTo
    //     );

    //     if (result.type === 'success') {
    //       // Extraer los parámetros de la URL de callback
    //       const url = new URL(result.url);
    //       const code = url.searchParams.get('code');
    //       const error = url.searchParams.get('error');

    //       if (error) {
    //         throw new Error(error);
    //       }

    //       if (code) {
    //         // Intercambiar el código por una sesión
    //         const { data: sessionData, error: sessionError } =
    //           await supabase.auth.exchangeCodeForSession(code);

    //         if (sessionError) throw sessionError;

    //         if (sessionData.session) {
    //           // La sesión se actualizará automáticamente a través del AuthContext
    //           Alert.alert('Éxito', 'Inicio de sesión exitoso');
    //         }
    //       }
    //     }
    //   }
    // } catch (error: any) {
    //   console.error('Error en Google Sign In:', error);
    //   Alert.alert(
    //     'Error',
    //     error.message || 'No se pudo iniciar sesión con Google'
    //   );
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continuar con Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
