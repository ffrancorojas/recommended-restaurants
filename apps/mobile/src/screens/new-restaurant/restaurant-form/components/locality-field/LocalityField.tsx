import { AppTextField } from '@/components/text-field';
import type { RestaurantFieldProps } from '../../restaurantForm.types';

export const LocalityField = ({ value, onChange, visitOnly = false }: RestaurantFieldProps) => (
  <AppTextField
    editable={!visitOnly}
    accessibilityState={{ disabled: visitOnly }}
    label="Localidad"
    value={value.locality}
    onChangeText={(text) => onChange('locality', text)}
    placeholder="Ciudad, barrio o dirección"
  />
);
