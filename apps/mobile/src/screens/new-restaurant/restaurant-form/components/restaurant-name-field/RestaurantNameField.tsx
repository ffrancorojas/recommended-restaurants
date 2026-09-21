import { RestaurantSearchButtons } from '@/components/restaurant-search-buttons';
import { TextInput, View } from 'react-native';
import { AppText } from '@/components/text';
import { useRestaurantFormStyles } from '../../restaurantForm.styles';
import type { RestaurantNameFieldProps } from '../../restaurantForm.types';
import { useAppColors } from '@/theme';

export const RestaurantNameField = ({ value, onChange, visitOnly = false }: RestaurantNameFieldProps) => {
  const styles = useRestaurantFormStyles();
  const colors = useAppColors();
  return <View style={styles.field}>
    <AppText style={styles.label} text="Restaurante *" />
    <View style={styles.nameRow}>
      <TextInput
        editable={!visitOnly}
        accessibilityState={{ disabled: visitOnly }}
        style={[styles.input, styles.nameInput]}
        placeholder="Nombre del restaurante"
        placeholderTextColor={colors.placeholder}
        value={value.name}
        onChangeText={(text) => onChange('name', text)}
      />
      <RestaurantSearchButtons name={value.name} locality={value.locality} disabled={visitOnly} />
    </View>
    <AppText
      style={styles.help}
      text="Busca el nombre en Google Maps o Google para consultar dirección y opiniones."
    />
  </View>;
};
