import { RESTAURANT_RATINGS } from '@restaurantes/contracts';
import { Pressable, View } from 'react-native';
import { RatingFace } from '@/components/rating-face/RatingFace';
import { AppText } from '@/components/text';
import { VisitedIcon } from '../../VisitedIcon';
import { styles } from '../../restaurantCard.styles';
import type { RestaurantVisitStatusProps } from './restaurantVisitStatus.types';

export const RestaurantVisitStatus = ({ restaurant, onVisit }: RestaurantVisitStatusProps) => {
  const rating = RESTAURANT_RATINGS.find((option) => option.value === restaurant.rating);

  return restaurant.visited ? (
    <View
      style={styles.visitStatus}
      accessible
      accessibilityLabel={`Visitado${rating ? `, ${rating.label}` : ''}`}
    >
      <VisitedIcon />
      {rating ? <RatingFace rating={rating.value} size={32} /> : null}
    </View>
  ) : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Marcar ${restaurant.name} como visitado`}
      style={styles.visitButton}
      hitSlop={{ top: 4, bottom: 8 }}
      onPress={(event) => {
        event.stopPropagation();
        onVisit();
      }}
    >
      <AppText style={styles.visitedSymbol} text="Registrar visita" />
    </Pressable>
  );
};
