import { Text } from 'react-native';
import { AppTextProps } from './appText.types';

export const AppText = ({ text, style, numberOfLines }: AppTextProps) => {
  return <Text style={style} numberOfLines={numberOfLines}>{text}</Text>;
};
