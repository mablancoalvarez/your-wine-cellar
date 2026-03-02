import { Redirect } from 'expo-router';

export default function Index() {
  // Redirigir al login al cargar la app
  return <Redirect href="/login" />;
}
