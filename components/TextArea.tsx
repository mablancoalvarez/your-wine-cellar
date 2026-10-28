import { colors } from '@/lib/theme';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { FieldLabel } from './FieldLabel';

interface TextAreaProps extends TextInputProps {
  label: string;
  hint?: string;
  required?: boolean;
  /** Optional content anchored to the card footer (counter, notices…). */
  footer?: React.ReactNode;
}

export function TextArea({
  label,
  hint,
  required = false,
  footer,
  style,
  ...props
}: TextAreaProps) {
  return (
    <View style={styles.container}>
      <FieldLabel label={label} hint={hint} required={required} />

      <View style={styles.card}>
        <TextInput
          style={[styles.textArea, style]}
          multiline
          textAlignVertical="top"
          placeholderTextColor={colors.muted}
          {...props}
        />
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  textArea: {
    minHeight: 96,
    fontSize: 16,
    lineHeight: 23,
    color: colors.text,
    padding: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
