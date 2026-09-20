import { AppTextField } from '@/components/text-field';
import type { RestaurantFieldProps } from '../../restaurantForm.types';

export const NotesField = ({ value, onChange, visitOnly = false }: RestaurantFieldProps) => (
  <AppTextField
    editable={!visitOnly}
    accessibilityState={{ disabled: visitOnly }}
    label="Observaciones"
    value={value.notes}
    onChangeText={(text) => onChange('notes', text)}
    placeholder="Reserva, detalles a tener en cuenta..."
    multiline
  />
);
