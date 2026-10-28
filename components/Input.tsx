import { colors } from '@/lib/theme';
import { MaterialIcons } from '@expo/vector-icons';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { FieldLabel } from './FieldLabel';

interface InputProps extends TextInputProps {
  label: string;
  hint?: string;
  required?: boolean;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  hint,
  required = false,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: InputProps) {
  return (
    <View style={styles.container}>
      <FieldLabel label={label} hint={hint} required={required} />

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, rightIcon ? styles.inputWithIcon : null, style]}
          placeholderTextColor={colors.muted}
          {...props}
        />
        {rightIcon ? (
          <View style={styles.iconBox}>
            {onRightIconPress ? (
              <TouchableOpacity onPress={onRightIconPress} hitSlop={8}>
                <MaterialIcons
                  name={rightIcon}
                  size={20}
                  color={colors.muted}
                  style={styles.icon}
                />
              </TouchableOpacity>
            ) : (
              <MaterialIcons
                name={rightIcon}
                size={20}
                color={colors.muted}
                style={styles.icon}
              />
            )}
          </View>
        ) : null}
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
