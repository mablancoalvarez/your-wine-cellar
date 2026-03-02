import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { TextArea } from './TextArea';

interface WineFormData {
  name: string;
  vintage: string;
  country: string;
  year: number;
  grape: string;
  rating: number;
  notes: string;
}

interface AddWineFormProps {
  onSubmit: (data: WineFormData) => void;
  onCancel: () => void;
}

export function AddWineForm({ onSubmit, onCancel }: AddWineFormProps) {
  const [formData, setFormData] = useState<WineFormData>({
    name: '',
    winery: '',
    country: '',
    year: new Date().getFullYear(),
    grape: '',
    rating: 0,
    notes: '',
  });

  const handleSubmit = () => {
    // Validar campos requeridos
    if (
      !formData.name ||
      !formData.winery ||
      !formData.country ||
      !formData.grape
    ) {
      // TODO: Mostrar error de validación
      return;
    }
    onSubmit(formData);
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.subtitle}>
        Completa la información del vino que deseas añadir a tu bodega
      </Text>

      {/* Nombre */}
      <Input
        label="Nombre"
        required
        placeholder="Ej: Reserva Especial"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        rightIcon="person"
        onRightIconPress={() => {
          // TODO: Implementar selector de nombres sugeridos
          console.log('Abrir selector de nombres');
        }}
      />

      {/* Bodega */}
      <Input
        label="Bodega"
        required
        placeholder="Ej: Bodegas Torres"
        value={formData.winery}
        onChangeText={(text) => setFormData({ ...formData, winery: text })}
      />

      {/* País y Año en fila */}
      <View style={styles.row}>
        <View style={[styles.halfWidth, { marginRight: 6 }]}>
          <Input
            label="País"
            required
            placeholder="Ej: España"
            value={formData.country}
            onChangeText={(text) => setFormData({ ...formData, country: text })}
          />
        </View>
        <View style={[styles.halfWidth, { marginLeft: 6 }]}>
          <NumberInput
            label="Año"
            value={formData.year}
            onChange={(value) => setFormData({ ...formData, year: value })}
            min={1900}
            max={new Date().getFullYear() + 1}
          />
        </View>
      </View>

      {/* Tipo de Uva */}
      <Input
        label="Tipo de Uva"
        required
        placeholder="Ej: Tempranillo"
        value={formData.grape}
        onChangeText={(text) => setFormData({ ...formData, grape: text })}
      />

      {/* Valoración */}
      <NumberInput
        label="Valoración (0-5)"
        value={formData.rating}
        onChange={(value) => setFormData({ ...formData, rating: value })}
        min={0}
        max={5}
      />

      {/* Notas */}
      <TextArea
        label="Notas"
        placeholder="Añade tus notas de cata..."
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
      />

      {/* Botones */}
      <View style={styles.buttonsContainer}>
        <Button
          title="Guardar"
          variant="primary"
          fullWidth
          onPress={handleSubmit}
          style={styles.saveButton}
        />
        <Button
          title="Cancelar"
          variant="outline"
          fullWidth
          onPress={onCancel}
          style={styles.cancelButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
    flexGrow: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
  },
  halfWidth: {
    flex: 1,
  },
  buttonsContainer: {
    marginTop: 8,
  },
  saveButton: {
    marginBottom: 12,
  },
  cancelButton: {},
});
