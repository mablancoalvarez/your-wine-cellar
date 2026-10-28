import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/lib/alert';
import { findDefaultCellar } from '@/lib/cellars';
import { getErrorMessage } from '@/lib/errors';
import { colors, fonts } from '@/lib/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddWineForm, Avatar } from '../components';
import { createWine, listCellars, type WineInput } from '../lib/api';

export default function AddWineScreen() {
  const router = useRouter();
  const { loading, user } = useAuth();
  const [cellarId, setCellarId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    listCellars()
      .then((cellars) => {
        if (!active) return;
        setCellarId(findDefaultCellar(cellars)?.id ?? null);
      })
      .catch(() => {
        if (active) setCellarId(null);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleClose = useCallback(() => {
    // `dismissTo` removes the screen (and any duplicates in the stack) and, if
    // `/home` is not in the history, replaces it. Using `back()` alone left the
    // screen open when there was no history.
    router.dismissTo('/home');
  }, [router]);

  const handleSubmit = async (wineData: WineInput) => {
    if (!cellarId) {
      showAlert('Error', 'No hay una bodega donde guardar el vino');
      return;
    }

    try {
      setSubmitting(true);
      await createWine(cellarId, wineData);
      handleClose();
    } catch (error) {
      showAlert('Error', getErrorMessage(error, 'No se pudo guardar el vino'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <MaterialIcons name="close" size={24} color={colors.wine} />
          </TouchableOpacity>

          <Text style={styles.title}>Añadir Nuevo Vino</Text>

          <Avatar imageUrl={user?.avatarUrl} name={user?.name} size={40} />
        </View>

        <AddWineForm
          onSubmit={handleSubmit}
          onCancel={handleClose}
          submitting={submitting}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.serifSemiBold,
    fontSize: 22,
    color: colors.wine,
  },
});
