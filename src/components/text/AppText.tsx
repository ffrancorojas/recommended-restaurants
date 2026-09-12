import { Text } from 'react-native';
import { AppTextProps } from './appText.types';

export const AppText = ({ text, style }: AppTextProps) => {
  return <Text style={style}>{text}</Text>;
};
