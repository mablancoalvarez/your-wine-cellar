import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Storage adaptativo según la plataforma
let storageAdapter: any = null;

if (Platform.OS === 'web') {
  // Para web, usar localStorage
  if (typeof window !== 'undefined') {
    storageAdapter = {
      getItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return Promise.resolve(window.localStorage.setItem(key, value));
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return Promise.resolve(window.localStorage.removeItem(key));
        }
        return Promise.resolve();
      },
    };
  }
} else {
  // Para iOS/Android, usar AsyncStorage
  const AsyncStorage =
    require('@react-native-async-storage/async-storage').default;
  storageAdapter = AsyncStorage;
}
// Obtener las variables de entorno
const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// Verificar si hay configuración
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Crear el cliente solo si está configurado
// Si no hay configuración, retornar null para evitar errores
let supabaseClient: ReturnType<typeof createClient> | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: storageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
      },
    });
  } catch (error) {
    console.error('Error al crear cliente de Supabase:', error);
    supabaseClient = null;
  }
}

export const supabase = supabaseClient as ReturnType<typeof createClient>;
