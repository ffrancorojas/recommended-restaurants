import { Pressable, View } from 'react-native';
import { Info } from '../info';
import { AppText } from '@/components/text';
import { createRestaurantDetailsStyles } from './restaurantDetails.styles';
import type { RestaurantDetailsProps } from './restaurantDetails.types';
import { useThemedStyles } from '@/theme';

export const RestaurantDetails = ({ restaurant, onDelete }: RestaurantDetailsProps) => {
  const styles = useThemedStyles(createRestaurantDetailsStyles);
  return <View style={styles.details}>
    <Info label="Recomendado por" text={restaurant.recommendedBy} />
    <Info label="Platos recomendados" text={restaurant.dishes} />
    <Info label="Observaciones" text={restaurant.notes} />
    {restaurant.visited && <Info label="Mi opinión" text={restaurant.opinion} />}
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Eliminar ${restaurant.name}`}
      style={styles.deleteButton}
      onPress={(event) => {
        event.stopPropagation();
        onDelete();
      }}
    >
      <AppText style={styles.delete} text="Eliminar" />
    </Pressable>
  </View>;
};
