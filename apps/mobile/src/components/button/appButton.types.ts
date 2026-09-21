import type { StyleProp, ViewStyle } from 'react-native';

export type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
};
