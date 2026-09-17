import { AppText } from '../text';
import { Pressable } from 'react-native';
import { styles } from './appButton.styles';
import { AppButtonProps } from './appButton.types';

export const AppButton = ({ label, onPress, variant = 'primary', style, accessibilityLabel }: AppButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={[styles.button, variant === 'primary' ? styles.primary : styles.secondary, style]}
    >
      <AppText
        style={[styles.text, variant === 'primary' ? styles.primaryText : styles.secondaryText]}
        text={label}
      />
    </Pressable>
  );
};
