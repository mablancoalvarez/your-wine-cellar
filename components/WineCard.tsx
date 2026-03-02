import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WineCardProps {
  name: string;
  winery: string;
  country: string;
  grape: string;
  year: number;
  rating: number; // 1-5
  description: string;
  onPress?: () => void;
}

export function WineCard({
  name,
  winery,
  country,
  grape,
  year,
  rating,
  description,
  onPress,
}: WineCardProps) {
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name={index < rating ? 'star' : 'star-border'}
        size={16}
        color="#FFC107"
      />
    ));
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardContent}>
        {/* Icono de vino */}
        <View style={styles.iconContainer}>
          <MaterialIcons name="wine-bar" size={32} color="#8B4513" />
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          {/* Nombre y bodega */}
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.winery}>{winery}</Text>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <MaterialIcons name="place" size={14} color="#666" />
              <Text style={styles.tagText}>{country}</Text>
            </View>
            <View style={styles.tag}>
              <MaterialIcons name="eco" size={14} color="#666" />
              <Text style={styles.tagText}>{grape}</Text>
            </View>
            <View style={styles.tag}>
              <MaterialIcons name="calendar-today" size={14} color="#666" />
              <Text style={styles.tagText}>{year}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>{renderStars()}</View>

          {/* Descripción */}
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'flex-start',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  winery: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 2,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
