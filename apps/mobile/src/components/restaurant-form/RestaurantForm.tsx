import { AppButton, AppText } from '@/components';
import { AppTextField } from '@/components/text-field';
import { useRestaurants } from '@/services';
import { Alert, Linking, Pressable, Switch, TextInput, View } from 'react-native';
import { styles } from './restaurantForm.styles';
import { RestaurantFormProps } from './restaurantForm.types';

export const RestaurantForm = ({ value, onChange, onSave }: RestaurantFormProps) => {
  const { restaurantTypes, typesError, reloadTypes } = useRestaurants();
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
        <AppText style={styles.label} text="Restaurante *" />
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
            <AppText style={styles.mapsSymbol} text="⌖" />
          </Pressable>
          <Pressable
            accessibilityLabel="Buscar en Google"
            style={[styles.searchIcon, styles.googleIcon]}
            onPress={() => openSearch('google')}
          >
            <AppText style={styles.googleSymbol} text="G" />
          </Pressable>
        </View>
        <AppText
          style={styles.help}
          text="Busca el nombre en Google Maps o Google para consultar dirección y opiniones."
        />
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
      <AppText style={styles.label} text="Tipo de local" />
      {typesError ? <Pressable accessibilityRole="button" onPress={reloadTypes}><AppText text={typesError} /></Pressable> : null}
      <View style={styles.chips}>
        {restaurantTypes.map((type) => (
          <Pressable
            key={type}
            onPress={() => onChange('type', value.type === type ? '' : type)}
            style={[styles.chip, value.type === type && styles.chipSelected]}
          >
            <AppText
              style={[styles.chipText, value.type === type && styles.chipTextSelected]}
              text={type}
            />
          </Pressable>
        ))}
      </View>
      <AppTextField
        label="Recomendado por"
        value={value.recommendedBy}
        onChangeText={(text) => onChange('recommendedBy', text)}
        placeholder="Nombre de la persona que te lo recomendó"
      />
      <AppTextField
        label="Observaciones"
        value={value.notes}
        onChangeText={(text) => onChange('notes', text)}
        placeholder="Reserva, detalles a tener en cuenta..."
        multiline
      />
      <View style={styles.field}>
        <AppText style={styles.label} text="Ya he estado" />
        <Switch accessibilityLabel="Ya he estado" value={value.visited} onValueChange={(visited) => onChange('visited', visited)} />
      </View>
      {value.visited ? (
        <AppTextField
          label="Mi opinión"
          value={value.opinion}
          onChangeText={(text) => onChange('opinion', text)}
          placeholder="¿Qué te ha parecido? ¿Volverías?"
          maxLength={4000}
          multiline
        />
      ) : null}
      <AppButton label="Guardar restaurante" onPress={onSave} />
    </View>
  );
};
