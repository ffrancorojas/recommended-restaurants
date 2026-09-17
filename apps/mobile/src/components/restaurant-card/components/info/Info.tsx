import { View } from 'react-native';
import { AppText } from '@/components/text';
import { styles } from './info.styles';
import type { InfoProps } from './info.types';

export const Info = ({ label, text }: InfoProps) => {
  if (!text) return null;
  return (
    <View style={styles.info}>
      <AppText style={styles.infoLabel} text={label} />
      <AppText style={styles.infoText} text={text} />
    </View>
  );
};
