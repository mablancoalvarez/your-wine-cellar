import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  required?: boolean;
}

export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
  required = false,
}: NumberInputProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value.toString()}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            if (!isNaN(num) && num >= min && num <= max) {
              onChange(num);
            } else if (text === '') {
              onChange(min);
            }
          }}
          keyboardType="numeric"
          selectTextOnFocus
        />
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handleIncrement}
            style={styles.controlButton}
            disabled={value >= max}
          >
            <MaterialIcons
              name="keyboard-arrow-up"
              size={20}
              color={value >= max ? '#CCC' : '#666'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDecrement}
            style={styles.controlButton}
            disabled={value <= min}
          >
            <MaterialIcons
              name="keyboard-arrow-down"
              size={20}
              color={value <= min ? '#CCC' : '#666'}
            />
          </TouchableOpacity>
        </View>
      </View>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    padding: 0,
  },
  controls: {
    flexDirection: 'column',
    marginLeft: 8,
  },
  controlButton: {
    padding: 2,
  },
});



