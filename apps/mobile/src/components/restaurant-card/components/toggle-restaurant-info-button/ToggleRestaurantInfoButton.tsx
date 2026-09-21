import { Pressable, View } from 'react-native';
import { createRestaurantCardStyles } from '../../restaurantCard.styles';
import type { ToggleRestaurantInfoButtonProps } from './toggleRestaurantInfoButton.types';
import { useThemedStyles } from '@/theme';

export const ToggleRestaurantInfoButton = ({
  name,
  expanded,
  onToggle,
}: ToggleRestaurantInfoButtonProps) => {
  const styles = useThemedStyles(createRestaurantCardStyles);
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${expanded ? 'Ocultar' : 'Mostrar'} información de ${name}`}
    accessibilityState={{ expanded }}
    style={styles.iconButton}
    hitSlop={4}
    onPress={(event) => {
      event.stopPropagation();
      onToggle();
    }}
  >
    <View style={[styles.chevron, expanded && styles.chevronExpanded]} />
  </Pressable>;
};
