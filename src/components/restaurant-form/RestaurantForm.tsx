import { AppButton, AppTextField } from '@/components';
import { RESTAURANT_TYPES } from '@/types';
import { Alert, Linking, Pressable, Text, TextInput, View } from 'react-native';
import { styles } from './restaurantForm.styles';
import { RestaurantFormProps } from './restaurantForm.types';

export const RestaurantForm = ({ value, onChange, onSave }: RestaurantFormProps) => {
  const openSearch = async (service: 'maps' | 'google') => {
    if (!value.name.trim())
      return Alert.alert(
        'Escribe primero el nombre',
        'Introduce el nombre del bar o restaurante antes de buscar.'
      );
    const query = encodeURIComponent(value.name.trim());
    await Linking.openURL(
      service === 'maps'
        ? `https://www.google.com/maps/search/?api=1&query=${query}`
        : `https://www.google.com/search?q=${query}`
    );
  };
  return (
    <View>
      <View style={styles.field}>
        <Text style={styles.label}>Restaurante *</Text>
        <View style={styles.nameRow}>
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="Nombre del restaurante"
            placeholderTextColor="#9A9088"
            value={value.name}
            onChangeText={(text) => onChange('name', text)}
          />
          <Pressable
            accessibilityLabel="Buscar en Google Maps"
            style={[styles.searchIcon, styles.mapsIcon]}
            onPress={() => openSearch('maps')}
          >
            <Text style={styles.mapsSymbol}>⌖</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Buscar en Google"
            style={[styles.searchIcon, styles.googleIcon]}
            onPress={() => openSearch('google')}
          >
            <Text style={styles.googleSymbol}>G</Text>
          </Pressable>
        </View>
        <Text style={styles.help}>
          Busca el nombre en Google Maps o Google para consultar dirección y opiniones.
        </Text>
      </View>
      <AppTextField
        label="Localidad"
        value={value.locality}
        onChangeText={(text) => onChange('locality', text)}
        placeholder="Ciudad, barrio o dirección"
      />
      <AppTextField
        label="Platos recomendados"
        value={value.dishes}
        onChangeText={(text) => onChange('dishes', text)}
        placeholder="Ej. croquetas, ramen..."
      />
      <AppTextField
        label="Estimación de precio"
        value={value.price}
        onChangeText={(text) => onChange('price', text)}
        placeholder="Ej. 20–30 € por persona"
      />
      <Text style={styles.label}>Tipo de local</Text>
      <View style={styles.chips}>
        {RESTAURANT_TYPES.map((type) => (
          <Pressable
            key={type}
            onPress={() => onChange('type', value.type === type ? '' : type)}
            style={[styles.chip, value.type === type && styles.chipSelected]}
          >
            <Text style={[styles.chipText, value.type === type && styles.chipTextSelected]}>
              {type}
            </Text>
          </Pressable>
        ))}
      </View>
      <AppTextField
        label="Observaciones"
        value={value.notes}
        onChangeText={(text) => onChange('notes', text)}
        placeholder="Quién lo recomendó, qué pedir, reserva..."
        multiline
      />
      <AppButton label="Guardar restaurante" onPress={onSave} />
    </View>
  );
};
