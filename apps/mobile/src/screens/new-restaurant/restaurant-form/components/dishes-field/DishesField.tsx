import { AppTextField } from '@/components/text-field';
import type { RestaurantFieldProps } from '../../restaurantForm.types';

export const DishesField = ({ value, onChange, visitOnly = false }: RestaurantFieldProps) => (
  <AppTextField
    editable={!visitOnly}
    accessibilityState={{ disabled: visitOnly }}
    label="Platos recomendados"
    value={value.dishes}
    onChangeText={(text) => onChange('dishes', text)}
    placeholder="Ej. croquetas, ramen..."
  />
);
