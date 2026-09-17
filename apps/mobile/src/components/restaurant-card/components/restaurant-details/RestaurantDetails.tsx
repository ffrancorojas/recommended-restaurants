import { Pressable, View } from 'react-native';
import { Info } from '../info';
import { AppText } from '@/components/text';
import { styles } from './restaurantDetails.styles';
import type { RestaurantDetailsProps } from './restaurantDetails.types';

export const RestaurantDetails = ({ restaurant, onDelete }: RestaurantDetailsProps) => (
  <View style={styles.details}>
    <Info label="Recomendado por" text={restaurant.recommendedBy} />
    <Info label="Platos recomendados" text={restaurant.dishes} />
    <Info label="Observaciones" text={restaurant.notes} />
    {restaurant.visited ? <Info label="Mi opinión" text={restaurant.opinion} /> : null}
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
  </View>
);
