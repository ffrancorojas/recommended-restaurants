import { Pressable, View } from 'react-native';
import { AppText } from '../text';
import { createHeaderStyles } from './header.styles';
import type { HeaderProps } from './header.types';
import { useThemedStyles } from '@/theme';

export const Header = ({ title, onBack, backLabel = 'Inicio' }: HeaderProps) => {
  const styles = useThemedStyles(createHeaderStyles);
  return (
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
};
