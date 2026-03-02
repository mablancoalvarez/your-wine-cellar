import { MaterialIcons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const buttonStyle: ViewStyle[] = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    ...(fullWidth ? [styles.fullWidth] : []),
    ...(disabled || loading ? [styles.disabled] : []),
    style as ViewStyle,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  const renderIcon = () => {
    if (!icon || loading) return null;
    return (
      <MaterialIcons
        name={icon}
        size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
        color={variant === 'outline' ? '#8B4513' : '#fff'}
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#8B4513' : '#fff'}
          size="small"
        />
      ) : (
        <>
          {iconPosition === 'left' && renderIcon()}
          <Text style={textStyle}>{title}</Text>
          {iconPosition === 'right' && renderIcon()}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  primary: {
    backgroundColor: '#8B4513',
  },
  secondary: {
    backgroundColor: '#6B4423',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#8B4513',
  },
  danger: {
    backgroundColor: '#dc3545',
  },
  smallSize: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mediumSize: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  largeSize: {
    paddingHorizontal: 32,
    paddingVertical: 18,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#8B4513',
  },
  dangerText: {
    color: '#fff',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
