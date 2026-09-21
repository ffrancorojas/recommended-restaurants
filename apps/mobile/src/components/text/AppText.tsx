import { Text } from 'react-native';
import { AppTextProps } from './appText.types';
import { useAppColors } from '@/theme';

export const AppText = ({ text, style, numberOfLines }: AppTextProps) => {
  const colors = useAppColors();
  return (
    <Text style={[{ color: colors.text }, style]} numberOfLines={numberOfLines}>
      {text}
    </Text>
  );
};
