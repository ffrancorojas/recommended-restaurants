import { StyleProp, TextStyle } from 'react-native';

export type AppTextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};
