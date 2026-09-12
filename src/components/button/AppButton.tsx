import { Pressable, Text } from 'react-native';
import { styles } from './AppButton.styles';
import { AppButtonProps } from './appButton.types';

export const AppButton = ({ label, onPress, variant = 'primary' }: AppButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, variant === 'primary' ? styles.primary : styles.secondary]}
    >
      <Text
        style={[styles.text, variant === 'primary' ? styles.primaryText : styles.secondaryText]}
      >
        {label}
      </Text>
    </Pressable>
  );
};
