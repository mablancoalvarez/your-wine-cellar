import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ConfigErrorScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}> ⚠️ Configuración Requerida</Text>
      <Text style={styles.subtitle}>
        Falta la configuración de Supabase para que la app funcione
        correctamente.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pasos para configurar:</Text>
        <Text style={styles.step}>
          1. Crea un archivo <Text style={styles.code}>.env</Text> en la raíz
          del proyecto
        </Text>
        <Text style={styles.step}>2. Agrega las siguientes variables:</Text>
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>
            EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase{'\n'}
            EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
          </Text>
        </View>
        <Text style={styles.step}>
          3. Reinicia el servidor de Expo (detén y vuelve a ejecutar{' '}
          <Text style={styles.code}>npx expo start</Text>)
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          ¿Dónde obtener las credenciales?
        </Text>
        <Text style={styles.step}>
          • Ve a tu proyecto en{' '}
          <Text style={styles.link}>https://supabase.com</Text>
        </Text>
        <Text style={styles.step}>• Settings → API</Text>
        <Text style={styles.step}>
          • Copia la "Project URL" y la "anon/public key"
        </Text>
      </View>

      <Text style={styles.note}>
        💡 Consulta el archivo AUTH_SETUP.md para instrucciones detalladas
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#dc3545',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  step: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 13,
  },
  codeBlock: {
    backgroundColor: '#2d2d2d',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
  },
  codeText: {
    color: '#f8f8f2',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    color: '#4285F4',
    textDecorationLine: 'underline',
  },
  note: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
