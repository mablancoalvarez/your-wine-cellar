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

export function FilterButton({ label, value, ...props }: FilterButtonProps) {
  return (
    <TouchableOpacity style={styles.button} activeOpacity={0.7} {...props}>
      <Text style={styles.label}>{value || label}</Text>
      <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
});
