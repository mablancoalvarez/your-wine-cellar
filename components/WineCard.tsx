import { WineGlassIcon } from '@/components/WineGlassIcon';
import { colors, fonts } from '@/lib/theme';
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
  /** Number of bottles; shows the badge when provided. */
  bottles?: number;
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
  bottles,
  onPress,
}: WineCardProps) {
  const renderStars = () =>
    Array.from({ length: 5 }, (_, index) => {
      const filled = index < rating;
      return (
        <MaterialIcons
          key={index}
          name={filled ? 'star' : 'star-border'}
          size={17}
          color={filled ? colors.star : colors.starEmpty}
        />
      );
    });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.top}>
        <View style={styles.thumb}>
          <WineGlassIcon size={26} color={colors.wine} strokeWidth={1.4} />
          {bottles ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{bottles}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <TouchableOpacity
              onPress={onPress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={`Opciones de ${name}`}
            >
              <MaterialIcons name="more-horiz" size={22} color={colors.muted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.winery} numberOfLines={1}>
            {winery}
          </Text>
        </View>
      </View>

      <View style={styles.chips}>
        <View style={styles.chip}>
          <MaterialIcons name="place" size={13} color={colors.muted} />
          <Text style={styles.chipText}>{country}</Text>
        </View>
        <View style={styles.chip}>
          <MaterialIcons name="eco" size={13} color={colors.muted} />
          <Text style={styles.chipText}>{grape}</Text>
        </View>
        <View style={styles.chip}>
          <MaterialIcons name="calendar-today" size={13} color={colors.muted} />
          <Text style={styles.chipText}>{year}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.ratingRow}>
        <View style={styles.stars}>{renderStars()}</View>
        <Text style={styles.rating}>{rating.toFixed(1)}</Text>
      </View>

      {description ? (
        <Text style={styles.description} numberOfLines={2}>
          “{description}”
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.wine,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  top: {
    flexDirection: 'row',
    gap: 14,
  },
  thumb: {
    width: 62,
    height: 62,
    borderRadius: 14,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -7,
    bottom: -7,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
    backgroundColor: colors.wine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.cream,
  },
  info: {
    flex: 1,
    paddingTop: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: fonts.serifSemiBold,
    fontSize: 21,
    color: colors.wine,
  },
  winery: {
    marginTop: 4,
    fontSize: 15,
    color: colors.muted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.sand,
  },
  chipText: {
    fontSize: 11.5,
    letterSpacing: 0.6,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'uppercase',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginHorizontal: -16,
    marginTop: 14,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  rating: {
    marginLeft: 10,
    fontSize: 15.5,
    fontWeight: '600',
    color: colors.wine,
  },
  description: {
    marginTop: 8,
    fontFamily: fonts.serifItalic,
    fontSize: 14.5,
    lineHeight: 20,
    color: colors.muted,
  },
});
