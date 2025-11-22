import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

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
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch (error) {
    console.error('Error al crear cliente de Supabase:', error);
    supabaseClient = null;
  }
}

export const supabase = supabaseClient as ReturnType<typeof createClient>;
