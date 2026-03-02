import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AddWineForm,
  Avatar,
  Button,
  DropdownMenu,
  FilterButton,
  Modal,
  SearchBar,
  WineCard,
} from '../components';
import { supabase } from '../lib/supabase';

// Datos fake de vinos
const fakeWines = [
  {
    id: '1',
    name: 'Reserva Especial',
    winery: 'Bodegas Torres',
    country: 'España',
    grape: 'Tempranillo',
    year: 2019,
    rating: 4,
    description: 'Notas de frutos rojos, taninos suaves',
  },
  {
    id: '2',
    name: 'Château Margaux',
    winery: 'Château Margaux',
    country: 'Francia',
    grape: 'Cabernet Sauvignon',
    year: 2018,
    rating: 5,
    description: 'Elegante, complejo, con notas de cassis',
  },
  {
    id: '3',
    name: 'Chianti Classico',
    winery: 'Antinori',
    country: 'Italia',
    grape: 'Sangiovese',
    year: 2020,
    rating: 4,
    description: 'Afrutado, equilibrado, perfecto con pasta',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>();
  const [selectedGrape, setSelectedGrape] = useState<string | undefined>();
  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleAddWine = () => {
    setOpenModal(true);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo cerrar sesión');
            }
          },
        },
      ],
    );
  };

  const handleSaveWine = async (wineData: any) => {
    console.log('Guardar vino:', wineData);
    // TODO: Implementar guardado en Supabase
    setOpenModal(false);
    const { data, error } = await supabase
      .from('wines')
      .insert(wineData)
      .select();

    if (error) {
      console.error('Error al guardar vino:', error);
    }
  };

  const handleCancelAddWine = () => {
    setOpenModal(false);
  };

  const handleWinePress = (wineId: string) => {
    console.log('Ver detalles del vino:', wineId);
    setOpenModal(true);
    // TODO: Implementar navegación a detalles del vino
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="wine-bar" size={32} color="#8B4513" />
            <View style={styles.headerText}>
              <Text style={styles.title}>Mi Bodega</Text>
              <Text style={styles.subtitle}>
                {fakeWines.length} vinos en tu colección
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <DropdownMenu
              trigger={
                <View style={styles.profileButton}>
                  <Avatar
                    imageUrl={
                      user?.user_metadata?.avatar_url ||
                      user?.user_metadata?.picture ||
                      user?.user_metadata?.avatar
                    }
                    size={36}
                  />
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={20}
                    color="#1A1A1A"
                    style={styles.arrowIcon}
                  />
                </View>
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
          </View>
        </View>

        {/* Botón Añadir Vino */}
        <Button
          title="Añadir Vino"
          icon="add"
          iconPosition="left"
          fullWidth
          onPress={handleAddWine}
          style={styles.addButton}
        />

        {/* Barra de búsqueda */}
        <SearchBar
          placeholder="Buscar por nombre o bodega..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <FilterButton
            label="Todos los países"
            value={selectedCountry}
            onPress={() => {
              // TODO: Implementar modal de selección de país
              console.log('Seleccionar país');
            }}
          />
          <FilterButton
            label="Todas las uvas"
            value={selectedGrape}
            onPress={() => {
              // TODO: Implementar modal de selección de uva
              console.log('Seleccionar uva');
            }}
          />
        </View>

        {/* Lista de vinos */}
        <View style={styles.winesList}>
          {fakeWines.map((wine) => (
            <WineCard
              key={wine.id}
              name={wine.name}
              winery={wine.winery}
              country={wine.country}
              grape={wine.grape}
              year={wine.year}
              rating={wine.rating}
              description={wine.description}
              onPress={() => handleWinePress(wine.id)}
            />
          ))}
        </View>

        <Modal
          visible={openModal}
          title="Añadir Nuevo Vino"
          onClose={handleCancelAddWine}
          size="full"
          footer={null}
        >
          <AddWineForm
            onSubmit={handleSaveWine}
            onCancel={handleCancelAddWine}
          />
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  headerText: {
    marginLeft: 12,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    marginBottom: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  winesList: {
    marginTop: 8,
  },
});
