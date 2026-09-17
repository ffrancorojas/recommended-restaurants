import { Pressable, View } from 'react-native';
import { AppText } from '../text';
import { styles } from './header.styles';
import type { HeaderProps } from './header.types';

export const Header = ({ title, onBack, backLabel = 'Inicio' }: HeaderProps) => (
  <View style={styles.header}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={backLabel}
      onPress={onBack}
      hitSlop={12}
    >
      <AppText style={styles.back} text={`‹ ${backLabel}`} />
    </Pressable>
    <View accessible accessibilityRole="header">
      <AppText style={styles.headerTitle} text={title} />
    </View>
    <View style={styles.spacer} />
  </View>
);
