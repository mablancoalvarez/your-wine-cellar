import { colors } from '@/lib/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface DropdownMenuItem {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
}

export function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [visible, setVisible] = useState(false);

  const handleItemPress = (onPress: () => void) => {
    onPress();
    setVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
      >
        {trigger}
      </Pressable>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuItem, index === items.length - 1 && styles.menuItemLast]}
                onPress={() => handleItemPress(item.onPress)}
                accessibilityRole="button"
              >
                {item.icon ? (
                  <MaterialIcons
                    name={item.icon}
                    size={20}
                    color={item.danger ? colors.danger : colors.ink}
                    style={styles.icon}
                  />
                ) : null}
                <Text style={[styles.menuItemText, item.danger && styles.menuItemTextDanger]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: 8,
    minWidth: 180,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  icon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.ink,
  },
  menuItemTextDanger: {
    color: colors.danger,
  },
});
