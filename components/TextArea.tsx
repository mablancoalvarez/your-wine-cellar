import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface TextAreaProps extends TextInputProps {
  label: string;
  required?: boolean;
}

export function TextArea({
  label,
  required = false,
  style,
  ...props
}: TextAreaProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.textArea, style]}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  required: {
    color: '#dc3545',
  },
  textArea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});



