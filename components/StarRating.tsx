import { colors } from '@/lib/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FieldLabel } from './FieldLabel';

interface StarRatingProps {
  label?: string;
  hint?: string;
  value: number; // 0-5
  onChange: (value: number) => void;
}

/**
 * Star-based rating selector.
 */
export function StarRating({ label, hint, value, onChange }: StarRatingProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <FieldLabel label={label} hint={hint} /> : null}

      <View style={styles.card}>
        <View style={styles.stars}>
          {Array.from({ length: 5 }, (_, index) => {
            const star = index + 1;
            const filled = star <= value;
            return (
              <TouchableOpacity
                key={star}
                activeOpacity={0.7}
                onPress={() => onChange(star === value ? 0 : star)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                accessibilityRole="button"
                accessibilityLabel={`${star} de 5 estrellas`}
              >
                <MaterialIcons
                  name={filled ? 'star' : 'star-border'}
                  size={34}
                  color={filled ? colors.star : colors.muted}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{value} / 5</Text>
          </View>
          <Text style={styles.caption}>Toca una estrella para calificar</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 22,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 14,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
  },
  pill: {
    minWidth: 52,
    height: 26,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.wine,
  },
  caption: {
    fontSize: 13.5,
    color: colors.muted,
  },
});
