import { colors } from '@/lib/theme';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Platform,
  Pressable,
  Modal as RNModal,
  ModalProps as RNModalProps,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ModalProps extends Omit<RNModalProps, 'children'> {
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
}

export function Modal({
  title,
  children,
  showCloseButton = true,
  onClose,
  footer,
  size = 'medium',
  visible,
  ...props
}: ModalProps) {
  const isFull = size === 'full';

  const content = (
    <>
      {(title || showCloseButton) && (
        <View style={[styles.header, isFull && styles.headerFull]}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {showCloseButton ? (
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <MaterialIcons name="close" size={24} color={colors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <View style={isFull ? styles.bodyFull : styles.body}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );

  const contentStyle = [styles.content, isFull ? styles.contentFull : styles[`${size}Size`]];

  return (
    <RNModal
      visible={visible}
      transparent={!isFull}
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      {isFull ? (
        <SafeAreaView style={styles.overlayFull}>
          <View style={contentStyle}>{content}</View>
        </SafeAreaView>
      ) : (
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={contentStyle} onPress={(event) => event.stopPropagation()}>
            {content}
          </Pressable>
        </Pressable>
      )}
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayFull: {
    flex: 1,
    backgroundColor: colors.card,
    padding: 0,
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    flexDirection: 'column',
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
  contentFull: {
    flex: 1,
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  smallSize: {
    maxWidth: 300,
  },
  mediumSize: {
    maxWidth: 400,
  },
  largeSize: {
    maxWidth: 500,
  },
  fullSize: {
    maxWidth: '100%',
    maxHeight: '100%',
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerFull: {
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.ink,
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  body: {
    padding: 20,
    maxHeight: 500,
    minHeight: 200,
  },
  bodyFull: {
    flex: 1,
    padding: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
});
