# Componentes Reutilizables

Componentes nativos de React Native para la aplicación Cellar.

## Button

Botón reutilizable con múltiples variantes y tamaños.

### Props

- `title` (string, requerido): Texto del botón
- `variant` ('primary' | 'secondary' | 'outline' | 'danger'): Estilo del botón
- `size` ('small' | 'medium' | 'large'): Tamaño del botón
- `loading` (boolean): Muestra un spinner mientras carga
- `icon` (string): Nombre del icono de MaterialIcons
- `iconPosition` ('left' | 'right'): Posición del icono
- `fullWidth` (boolean): Botón de ancho completo
- `disabled` (boolean): Deshabilita el botón
- Todas las props de `TouchableOpacity`

### Ejemplo

```tsx
import { Button } from '../components';

// Botón primario
<Button title="Guardar" onPress={handleSave} />

// Botón con icono
<Button
  title="Agregar Vino"
  icon="add"
  variant="primary"
  onPress={handleAdd}
/>

// Botón de carga
<Button
  title="Enviar"
  loading={isSubmitting}
  onPress={handleSubmit}
/>

// Botón outline
<Button
  title="Cancelar"
  variant="outline"
  onPress={handleCancel}
/>
```

## Modal

Modal reutilizable con header, body y footer opcionales.

### Props

- `visible` (boolean, requerido): Controla la visibilidad del modal
- `title` (string): Título del modal
- `children` (ReactNode, requerido): Contenido del modal
- `showCloseButton` (boolean): Muestra botón de cerrar
- `onClose` (function): Callback cuando se cierra el modal
- `footer` (ReactNode): Contenido del footer
- `size` ('small' | 'medium' | 'large' | 'full'): Tamaño del modal
- Todas las props de `Modal` de React Native

### Ejemplo

```tsx
import { Modal, Button } from '../components';
import { useState } from 'react';

function MyComponent() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Button title="Abrir Modal" onPress={() => setModalVisible(true)} />

      <Modal
        visible={modalVisible}
        title="Confirmar Acción"
        onClose={() => setModalVisible(false)}
        footer={
          <>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => setModalVisible(false)}
              style={{ marginRight: 12 }}
            />
            <Button title="Confirmar" onPress={handleConfirm} />
          </>
        }
      >
        <Text>¿Estás seguro de que quieres realizar esta acción?</Text>
      </Modal>
    </>
  );
}
```
