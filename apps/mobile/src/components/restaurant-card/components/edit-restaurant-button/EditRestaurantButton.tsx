import { Pressable } from 'react-native';
import { AppText } from '@/components/text';
import { createRestaurantCardStyles } from '../../restaurantCard.styles';
import type { EditRestaurantButtonProps } from './editRestaurantButton.types';
import { useThemedStyles } from '@/theme';

export const EditRestaurantButton = ({ name, onEdit }: EditRestaurantButtonProps) => {
  const styles = useThemedStyles(createRestaurantCardStyles);
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`Editar ${name}`}
    style={styles.iconButton}
    hitSlop={4}
    onPress={(event) => {
      event.stopPropagation();
      onEdit();
    }}
  >
    <AppText style={styles.edit} text="✎" />
  </Pressable>;
};
