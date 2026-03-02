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
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      {size === 'full' ? (
        <SafeAreaView style={styles.overlayFull}>
          <View style={[styles.contentFull, styles[`${size}Size`]]}>
            {/* Header */}
            {(title || showCloseButton) && (
              <View style={styles.headerFull}>
                {title && <Text style={styles.title}>{title}</Text>}
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Body */}
            <View style={styles.bodyFull}>{children}</View>

            {/* Footer */}
            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </SafeAreaView>
      ) : (
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable
            style={[styles.content, styles[`${size}Size`]]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <View style={styles.header}>
                {title && <Text style={styles.title}>{title}</Text>}
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Body */}
            <View style={styles.body}>{children}</View>

            {/* Footer */}
            {footer && <View style={styles.footer}>{footer}</View>}
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
    backgroundColor: '#fff',
    padding: 0,
  },
  content: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#E0E0E0',
  },
  headerFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
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
    borderTopColor: '#E0E0E0',
  },
});
