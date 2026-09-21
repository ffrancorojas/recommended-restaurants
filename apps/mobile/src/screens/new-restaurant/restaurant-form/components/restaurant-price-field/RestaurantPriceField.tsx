import { View } from 'react-native';
import { AppText } from '@/components/text';
import { useRestaurantFormStyles } from '../../restaurantForm.styles';
import type { RestaurantPriceFieldProps } from '../../restaurantForm.types';
import { PriceRangeSelect } from '../price-range-select';

export const RestaurantPriceField = ({ value, onChange, visitOnly = false }: RestaurantPriceFieldProps) => {
  const styles = useRestaurantFormStyles();
  return <View style={styles.field}>
    <AppText style={styles.label} text="Estimación de precio" />
    <PriceRangeSelect value={value.price} onChange={(price) => onChange('price', price)} disabled={visitOnly} />
  </View>;
};
