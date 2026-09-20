import { View } from 'react-native';
import { AppText } from '@/components/text';
import { styles } from '../../restaurantForm.styles';
import type { RestaurantPriceFieldProps } from '../../restaurantForm.types';
import { PriceRangeSelect } from '../price-range-select';

export const RestaurantPriceField = ({ value, onChange, visitOnly = false, legacyPrice }: RestaurantPriceFieldProps) => (
  <View style={styles.field}>
    <AppText style={styles.label} text="Estimación de precio" />
    <PriceRangeSelect value={value.price} onChange={(price) => onChange('price', price)} disabled={visitOnly} />
    {legacyPrice && !value.price ? <AppText style={styles.help} text={`Precio anterior: ${legacyPrice}. Selecciona un rango.`} /> : null}
  </View>
);
