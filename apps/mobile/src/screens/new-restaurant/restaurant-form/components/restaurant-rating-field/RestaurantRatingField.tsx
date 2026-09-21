import { Pressable, View } from 'react-native';
import { AppText } from '@/components/text';
import { useRestaurantFormStyles } from '../../restaurantForm.styles';
import type { RestaurantFieldProps } from '../../restaurantForm.types';
import { RESTAURANT_RATINGS } from '@restaurantes/contracts';
import { RatingFace } from '@/components/rating-face/RatingFace';

export const RestaurantRatingField = ({ value, onChange }: RestaurantFieldProps) => {
  const styles = useRestaurantFormStyles();
  return <>
    <AppText style={styles.label} text="¿Qué te ha parecido?" />
    <View style={styles.chips}>
      {RESTAURANT_RATINGS.map((option) => (
        <Pressable
          key={option.value}
          accessibilityRole="radio"
          accessibilityLabel={option.label}
          accessibilityState={{ checked: value.rating === option.value }}
          onPress={() => onChange('rating', option.value)}
          style={[styles.chip, styles.ratingOption, value.rating === option.value && styles.chipSelected]}
        >
          <RatingFace rating={option.value} />
          <AppText style={[styles.chipText, value.rating === option.value && styles.chipTextSelected]} text={option.label} />
        </Pressable>
      ))}
    </View>
  </>;
};
