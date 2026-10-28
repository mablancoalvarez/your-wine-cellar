import { colors } from '@/lib/theme';
import { MaterialIcons } from '@expo/vector-icons';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

interface SearchBarProps extends TextInputProps {
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export function SearchBar({
  placeholder = 'Buscar...',
  containerStyle,
  ...props
}: SearchBarProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.iconBox}>
        <MaterialIcons
          name="search"
          size={21}
          color={colors.muted}
          style={styles.icon}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    shadowColor: colors.wine,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  iconBox: {
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
