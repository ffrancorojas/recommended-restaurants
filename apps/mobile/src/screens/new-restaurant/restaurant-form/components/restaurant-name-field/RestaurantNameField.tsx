import { RestaurantSearchButtons } from '@/components/restaurant-search-buttons';
import { TextInput, View } from 'react-native';
import { AppText } from '@/components/text';
import { styles } from '../../restaurantForm.styles';
import type { RestaurantNameFieldProps } from '../../restaurantForm.types';

export const RestaurantNameField = ({ value, onChange, visitOnly = false }: RestaurantNameFieldProps) => (
  <View style={styles.field}>
    <AppText style={styles.label} text="Restaurante *" />
    <View style={styles.nameRow}>
      <TextInput
        editable={!visitOnly}
        accessibilityState={{ disabled: visitOnly }}
        style={[styles.input, styles.nameInput]}
        placeholder="Nombre del restaurante"
        placeholderTextColor="#9A9088"
        value={value.name}
        onChangeText={(text) => onChange('name', text)}
      />
      <RestaurantSearchButtons name={value.name} locality={value.locality} disabled={visitOnly} />
    </View>
    <AppText
      style={styles.help}
      text="Busca el nombre en Google Maps o Google para consultar dirección y opiniones."
    />
  </View>
);
