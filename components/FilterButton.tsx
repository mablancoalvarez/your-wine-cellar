import { colors } from '@/lib/theme';
import { MaterialIcons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

interface FilterButtonProps extends TouchableOpacityProps {
  label: string;
  value?: string;
}

export function FilterButton({ label, value, style, ...props }: FilterButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      activeOpacity={0.7}
      accessibilityRole="button"
      {...props}
    >
      <Text style={styles.label} numberOfLines={1}>
        {value || label}
      </Text>
      <MaterialIcons name="keyboard-arrow-down" size={20} color={colors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.sand,
    flex: 1,
  },
  label: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '500',
    color: colors.text,
  },
});
