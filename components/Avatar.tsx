import { colors } from '@/lib/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  imageUrl?: string | null;
  /** User name, used for the initials when there is no photo. */
  name?: string | null;
  size?: number;
  fallbackIcon?: keyof typeof MaterialIcons.glyphMap;
}

function getInitials(name?: string | null) {
  if (!name) return null;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

export function Avatar({
  imageUrl,
  name,
  size = 40,
  fallbackIcon = 'person',
}: AvatarProps) {
  const radius = size / 2;
  const initials = getInitials(name);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: radius },
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: radius }}
          contentFit="cover"
          transition={200}
        />
      ) : initials ? (
        <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
      ) : (
        <MaterialIcons name={fallbackIcon} size={size * 0.55} color={colors.cream} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.wine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.cream,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
