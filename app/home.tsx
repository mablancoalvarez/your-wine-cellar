import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
  // const { user, signOut } = useAuth();
  const user = null; // Temporal mientras no hay configuración
  const signOut = async () => {};

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Éxito', 'Sesión cerrada correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo cerrar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido!</Text>
      <Text style={styles.subtitle}>Has iniciado sesión correctamente</Text>

      {/* {user && (
        <View style={styles.userInfo}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
          {user.user_metadata?.full_name && (
            <>
              <Text style={styles.label}>Nombre:</Text>
              <Text style={styles.value}>{user.user_metadata.full_name}</Text>
            </>
          )}
        </View>
      )} */}

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Cerrar Sesión</Text>
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
  userInfo: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 8,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
