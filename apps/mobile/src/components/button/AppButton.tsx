import { AppText } from '../text';
import { Pressable } from 'react-native';
import { createAppButtonStyles } from './appButton.styles';
import { AppButtonProps } from './appButton.types';
import { useThemedStyles } from '@/theme';

export const AppButton = ({ label, onPress, variant = 'primary', style, accessibilityLabel, disabled = false }: AppButtonProps) => {
  const styles = useThemedStyles(createAppButtonStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, variant === 'primary' ? styles.primary : styles.secondary, disabled && { opacity: 0.6 }, style]}
    >
      <AppText
        style={[styles.text, variant === 'primary' ? styles.primaryText : styles.secondaryText]}
        text={label}
      />
    </Pressable>
  );
};
