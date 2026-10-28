import { Alert, Platform } from 'react-native';

function formatMessage(title: string, body?: string) {
  return body ? `${title}\n\n${body}` : title;
}

/**
 * `Alert.alert` is a no-op on react-native-web. This helper uses the native
 * browser dialog on web and `Alert` on iOS/Android.
 */
export function showAlert(title: string, body?: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(formatMessage(title, body));
    }
    return;
  }
  Alert.alert(title, body);
}

/**
 * Cross-platform destructive confirmation. On web it uses `window.confirm`
 * because `Alert.alert` with buttons does not work.
 */
export function confirmDestructive(
  title: string,
  body: string,
  confirmLabel: string,
  onConfirm: () => void | Promise<void>,
) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(formatMessage(title, body))) {
      void onConfirm();
    }
    return;
  }

  Alert.alert(title, body, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
