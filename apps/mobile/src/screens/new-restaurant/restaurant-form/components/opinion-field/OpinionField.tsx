import { AppTextField } from '@/components/text-field';
import type { RestaurantFieldProps } from '../../restaurantForm.types';

export const OpinionField = ({ value, onChange }: RestaurantFieldProps) => (
  <AppTextField
    label="Mi opinión"
    value={value.opinion}
    onChangeText={(text) => onChange('opinion', text)}
    placeholder="¿Qué te ha gustado? ¿Qué no recomendarías?"
    maxLength={4000}
    multiline
  />
);
