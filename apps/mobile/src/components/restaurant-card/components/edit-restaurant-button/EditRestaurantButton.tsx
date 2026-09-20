import { Pressable } from 'react-native';
import { AppText } from '@/components/text';
import { styles } from '../../restaurantCard.styles';
import type { EditRestaurantButtonProps } from './editRestaurantButton.types';

export const EditRestaurantButton = ({ name, onEdit }: EditRestaurantButtonProps) => (
  <Pressable
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
  </Pressable>
);
