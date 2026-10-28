import { colors, fonts } from '@/lib/theme';
import { showAlert } from '@/lib/alert';
import type { WineInput } from '@/lib/api';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { Input } from './Input';
import { NumberInput } from './NumberInput';
import { StarRating } from './StarRating';
import { TextArea } from './TextArea';

interface AddWineFormProps {
  onSubmit: (data: WineInput) => void | Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

const MAX_NOTES = 400;

export function AddWineForm({ onSubmit, onCancel, submitting = false }: AddWineFormProps) {
  const [formData, setFormData] = useState<WineInput>({
    name: '',
    winery: '',
    country: '',
    year: new Date().getFullYear(),
    grape: '',
    rating: 0,
    notes: '',
  });

  const update = <K extends keyof WineInput>(key: K, value: WineInput[K]) =>
    setFormData((current) => ({ ...current, [key]: value }));

  const handleSubmit = () => {
    const missing: string[] = [];
    if (!formData.name.trim()) missing.push('nombre');
    if (!formData.winery.trim()) missing.push('bodega');
    if (!formData.country.trim()) missing.push('país');
    if (!formData.grape.trim()) missing.push('uva');

    if (missing.length > 0) {
      showAlert('Faltan datos', `Indica al menos ${missing.join(', ')}.`);
      return;
    }

    onSubmit(formData);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Editorial header */}
      <View style={styles.hero}>
        <Image
          source={require('../assets/images/cellar-hero.jpg')}
          style={styles.heroImage}
          contentFit="cover"
          transition={200}
        />

        <View style={styles.heroText}>
          <Text style={styles.heroEyebrow}>NUEVA REFERENCIA</Text>
          <Text style={styles.heroTitle}>Ficha de Cata &amp; Bodega</Text>
          <Text style={styles.heroBody}>
            Completa la información del vino que deseas registrar en tu cava…
          </Text>
        </View>
      </View>

      <Input
        label="Nombre del vino"
        hint="Requerido"
        required
        placeholder="Ej: Reserva Especial"
        rightIcon="wine-bar"
        value={formData.name}
        onChangeText={(text) => update('name', text)}
      />

      <Input
        label="Bodega / Productor"
        required
        placeholder="Ej: Bodegas Torres"
        rightIcon="business"
        value={formData.winery}
        onChangeText={(text) => update('winery', text)}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Input
            label="País"
            required
            placeholder="Ej: España"
            rightIcon="public"
            value={formData.country}
            onChangeText={(text) => update('country', text)}
          />
        </View>
        <View style={styles.half}>
          <NumberInput
            label="Añada (Año)"
            value={formData.year}
            onChange={(value) => update('year', value)}
            min={1900}
            max={new Date().getFullYear() + 1}
          />
        </View>
      </View>

      <Input
        label="Tipo de Uva / Variedad"
        required
        placeholder="Ej: Tempranillo, Garnacha..."
        rightIcon="eco"
        value={formData.grape}
        onChangeText={(text) => update('grape', text)}
      />

      <StarRating
        label="Valoración (0 – 5)"
        hint="Opcional"
        value={formData.rating}
        onChange={(value) => update('rating', value)}
      />

      <TextArea
        label="Notas de Cata & Aromas"
        hint="Opcional"
        placeholder="Añade tus impresiones: ribete violáceo, frutos rojos maduros, taninos sedosos, paso elegante por barrica de roble…"
        maxLength={MAX_NOTES}
        value={formData.notes}
        onChangeText={(text) => update('notes', text)}
        footer={
          <>
            <View style={styles.diary}>
              <MaterialIcons name="bookmark-border" size={14} color={colors.muted} />
              <Text style={styles.diaryText}>DIARIO PRIVADO</Text>
            </View>
            <Text style={styles.counter}>
              {formData.notes.length} / {MAX_NOTES}
            </Text>
          </>
        }
      />

      <Button
        title="Guardar en Cava"
        icon="bookmark-border"
        fullWidth
        loading={submitting}
        onPress={handleSubmit}
        textStyle={styles.buttonText}
        style={styles.saveButton}
      />
      <Button
        title="Cancelar"
        variant="secondary"
        fullWidth
        onPress={onCancel}
        textStyle={styles.buttonText}
        style={styles.cancelButton}
      />

      <View style={styles.footerRule} />
      <Text style={styles.footerText}>COLECCIÓN CELLAR · BODEGA PRIVADA</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  hero: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.sand,
    marginBottom: 24,
  },
  heroImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    justifyContent: 'center',
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.wine,
  },
  heroTitle: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 20,
    color: colors.wine,
    marginTop: 4,
  },
  heroBody: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  diary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diaryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.muted,
  },
  counter: {
    fontSize: 13,
    color: colors.muted,
  },
  buttonText: {
    fontFamily: fonts.serifMedium,
    fontSize: 17,
  },
  saveButton: {
    marginTop: 6,
    height: 56,
  },
  cancelButton: {
    marginTop: 12,
    height: 56,
  },
  footerRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginTop: 28,
  },
  footerText: {
    marginTop: 14,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    color: colors.muted,
    textAlign: 'center',
  },
});
