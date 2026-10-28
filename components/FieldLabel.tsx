import { colors } from '@/lib/theme';
import { StyleSheet, Text, View } from 'react-native';

interface FieldLabelProps {
  label: string;
  hint?: string;
  required?: boolean;
}

/**
 * Shared header for form fields: label, required marker and hint.
 * Centralizing it keeps the fields visually consistent.
 */
export function FieldLabel({ label, hint, required = false }: FieldLabelProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: 14,
    color: colors.muted,
  },
  required: {
    color: colors.danger,
  },
});
