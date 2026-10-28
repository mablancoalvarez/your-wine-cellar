import { colors } from '@/lib/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabId = 'cava' | 'descubrir' | 'favoritos' | 'perfil';

interface Tab {
  id: TabId;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const TABS: Tab[] = [
  { id: 'cava', label: 'Cava', icon: 'menu-book' },
  { id: 'descubrir', label: 'Descubrir', icon: 'explore' },
  { id: 'favoritos', label: 'Favoritos', icon: 'favorite-border' },
  { id: 'perfil', label: 'Perfil', icon: 'person-add' },
];

interface BottomTabBarProps {
  active: TabId;
  onPress?: (tab: TabId) => void;
}

/**
 * Bottom navigation bar. For now only "Cava" has content.
 */
export function BottomTabBar({ active, onPress }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const color = isActive ? colors.wine : colors.muted;

        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.item}
            activeOpacity={0.7}
            onPress={() => onPress?.(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <MaterialIcons name={tab.icon} size={24} color={color} />
            <Text style={[styles.label, { color }, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.paper,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
  },
  labelActive: {
    fontWeight: '600',
  },
});
