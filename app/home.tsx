import { useAuth } from '@/contexts/AuthContext';
import { useCellarWines } from '@/hooks/useCellarWines';
import { getErrorMessage } from '@/lib/errors';
import { colors, fonts } from '@/lib/theme';
import { filterWines, getFilterOptions, type WineFilterKind } from '@/lib/wine-filters';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeader,
  Avatar,
  BottomTabBar,
  Button,
  DropdownMenu,
  FilterButton,
  Modal,
  SearchBar,
  TabId,
  WineCard,
  WineGlassIcon,
} from '../components';
import { confirmDestructive, showAlert } from '../lib/alert';

export default function HomeScreen() {
  const router = useRouter();
  const { loading, signOut, user } = useAuth();
  const { cellar, wines, error: listError } = useCellarWines(Boolean(user));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
  const [selectedGrape, setSelectedGrape] = useState<string | undefined>();
  const [filterKind, setFilterKind] = useState<WineFilterKind | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  const handleAddWine = () => {
    router.push('/add-wine');
  };

  const handleSignOut = () => {
    confirmDestructive(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      'Cerrar Sesión',
      async () => {
        try {
          await signOut();
          router.replace('/login');
        } catch (error) {
          showAlert('Error', getErrorMessage(error, 'No se pudo cerrar sesión'));
        }
      },
    );
  };

  const handleWinePress = () => {
    // TODO: navigate to the detail screen once it exists.
  };

  const handleTabPress = (tab: TabId) => {
    if (tab === 'cava') return;
    showAlert('Próximamente', 'Esta sección estará disponible pronto.');
  };

  const countries = useMemo(() => getFilterOptions(wines, 'country'), [wines]);
  const grapes = useMemo(() => getFilterOptions(wines, 'grape'), [wines]);

  const visibleWines = useMemo(
    () =>
      filterWines(wines, {
        query: searchQuery,
        country: selectedCountry,
        grape: selectedGrape,
      }),
    [wines, searchQuery, selectedCountry, selectedGrape],
  );

  const filterOptions = filterKind === 'grape' ? grapes : countries;
  const activeFilter = filterKind === 'grape' ? selectedGrape : selectedCountry;
  const allFilterLabel = filterKind === 'grape' ? 'Todas las uvas' : 'Todos los países';

  const applyFilter = (value?: string) => {
    if (filterKind === 'grape') {
      setSelectedGrape(value);
    } else {
      setSelectedCountry(value);
    }
    setFilterKind(null);
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.wine} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <AppHeader
          right={
            <DropdownMenu
              trigger={
                <Avatar imageUrl={user.avatarUrl} name={user.name} size={40} />
              }
              items={[
                {
                  label: 'Cerrar Sesión',
                  icon: 'logout',
                  onPress: handleSignOut,
                  danger: true,
                },
              ]}
            />
          }
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Active cellar */}
          <View style={styles.cellarRow}>
            <View style={styles.cellarEmblem}>
              <WineGlassIcon size={26} color={colors.wine} strokeWidth={1.4} />
            </View>

            <View style={styles.cellarInfo}>
              <View style={styles.cellarNameRow}>
                <Text style={styles.cellarName}>{cellar?.name ?? 'Mi Bodega'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.wine} />
              </View>
              <View style={styles.cellarCountRow}>
                <View style={styles.cellarDot} />
                <Text style={styles.cellarCount} numberOfLines={1}>
                  {listError ?? `${wines.length} vinos en tu colección privada`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.filterCircle}
              onPress={() => setFilterKind('country')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Filtrar vinos"
            >
              <MaterialIcons name="tune" size={22} color={colors.wine} />
            </TouchableOpacity>
          </View>

          {/* Add wine */}
          <Button
            title="Añadir Vino"
            icon="add"
            fullWidth
            onPress={handleAddWine}
            textStyle={styles.addButtonText}
            style={styles.addButton}
          />

          {/* Search */}
          <SearchBar
            placeholder="Buscar por nombre o bodega..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchBar}
          />

          {/* Filters */}
          <View style={styles.filtersRow}>
            <FilterButton
              label="Todos los países"
              value={selectedCountry}
              onPress={() => setFilterKind('country')}
            />
            <FilterButton
              label="Todas las uvas"
              value={selectedGrape}
              onPress={() => setFilterKind('grape')}
            />
          </View>

          {/* Wine list */}
          <View style={styles.winesList}>
            {visibleWines.map((wine) => (
              <WineCard
                key={wine.id}
                name={wine.name}
                winery={wine.winery}
                country={wine.country}
                grape={wine.grape}
                year={wine.year}
                rating={wine.rating}
                description={wine.notes}
                onPress={handleWinePress}
              />
            ))}
            {visibleWines.length === 0 && (
              <Text style={styles.emptyText}>
                {wines.length === 0
                  ? 'Aún no has añadido ningún vino.'
                  : 'No hay vinos que coincidan con la búsqueda o los filtros.'}
              </Text>
            )}
          </View>

          {/* Tip */}
          <View style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <MaterialIcons name="event-available" size={26} color={colors.wine} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Consejo de Sumiller</Text>
              <Text style={styles.tipText}>
                Mantén tu reserva de 2026 a una temperatura constante entre 12°C y 15°C.
              </Text>
            </View>
          </View>
        </ScrollView>

        <BottomTabBar active="cava" onPress={handleTabPress} />

        <Modal
          visible={filterKind !== null}
          title={filterKind === 'grape' ? 'Filtrar por uva' : 'Filtrar por país'}
          onClose={() => setFilterKind(null)}
          size="small"
          footer={null}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterOption, !activeFilter && styles.filterOptionSelected]}
              onPress={() => applyFilter(undefined)}
            >
              <Text style={styles.filterOptionText}>{allFilterLabel}</Text>
              {!activeFilter && <MaterialIcons name="check" size={20} color={colors.wine} />}
            </TouchableOpacity>

            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterOption,
                  activeFilter === option && styles.filterOptionSelected,
                ]}
                onPress={() => applyFilter(option)}
              >
                <Text style={styles.filterOptionText}>{option}</Text>
                {activeFilter === option && (
                  <MaterialIcons name="check" size={20} color={colors.wine} />
                )}
              </TouchableOpacity>
            ))}

            {filterOptions.length === 0 && (
              <Text style={styles.filterEmpty}>No hay opciones disponibles todavía.</Text>
            )}
          </ScrollView>
        </Modal>

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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 32,
  },
  cellarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cellarEmblem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellarInfo: {
    flex: 1,
  },
  cellarNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cellarName: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 26,
    color: colors.wine,
  },
  cellarCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 3,
  },
  cellarDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.star,
  },
  cellarCount: {
    flex: 1,
    fontSize: 14.5,
    color: colors.muted,
  },
  filterCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    marginTop: 26,
    height: 58,
  },
  addButtonText: {
    fontFamily: fonts.serifMedium,
    fontSize: 17,
  },
  searchBar: {
    marginTop: 28,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  winesList: {
    marginTop: 28,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14.5,
    color: colors.muted,
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.sand,
  },
  tipIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 17,
    color: colors.wine,
    marginBottom: 3,
  },
  tipText: {
    fontSize: 14.5,
    lineHeight: 20,
    color: colors.muted,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  filterOptionSelected: {
    backgroundColor: colors.sand,
  },
  filterOptionText: {
    fontSize: 15,
    color: colors.text,
  },
  filterEmpty: {
    paddingVertical: 12,
    fontSize: 14,
    color: colors.muted,
  },
});
