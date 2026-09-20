import { AppTextField } from '@/components/text-field';
import type { RestaurantFieldProps } from '../../restaurantForm.types';

export const RecommendedByField = ({ value, onChange, visitOnly = false }: RestaurantFieldProps) => (
  <AppTextField
    editable={!visitOnly}
    accessibilityState={{ disabled: visitOnly }}
    label="Recomendado por"
    value={value.recommendedBy}
    onChangeText={(text) => onChange('recommendedBy', text)}
    placeholder="Nombre de la persona que te lo recomendó"
  />
);
