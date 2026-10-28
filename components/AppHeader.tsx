import { WineGlassIcon } from '@/components/WineGlassIcon';
import { colors, fonts } from '@/lib/theme';
import { StyleSheet, Text, View } from 'react-native';

interface AppHeaderProps {
  /** Action or menu aligned to the right (usually the avatar). */
  right?: React.ReactNode;
}

/**
 * Top bar with the app name and profile access.
 */
export function AppHeader({ right }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <WineGlassIcon size={22} color={colors.wine} strokeWidth={1.6} />
        <Text style={styles.brandText}>Mi Cava</Text>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.paper,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.hairline,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandText: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 22,
    color: colors.wine,
  },
  right: {
    alignItems: 'flex-end',
  },
});
