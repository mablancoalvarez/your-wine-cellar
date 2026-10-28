import { colors } from '@/lib/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';
import { FieldLabel } from './FieldLabel';

interface NumberInputProps {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
}

export function NumberInput({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 9999,
  required = false,
  rightIcon = 'calendar-today',
}: NumberInputProps) {
  return (
    <View style={styles.container}>
      <FieldLabel label={label} hint={hint} required={required} />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.inputWithIcon]}
          value={value ? String(value) : ''}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            if (!isNaN(num) && num >= min && num <= max) {
              onChange(num);
            }
          }}
          keyboardType="number-pad"
          selectTextOnFocus
          maxLength={4}
          placeholderTextColor={colors.muted}
        />
        <View style={styles.iconBox}>
          <MaterialIcons
            name={rightIcon}
            size={20}
            color={colors.muted}
            style={styles.icon}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  inputWithIcon: {
    paddingRight: 26,
  },
  iconBox: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  icon: {
    includeFontPadding: false,
    height: 20,
    lineHeight: 20,
  },
});
