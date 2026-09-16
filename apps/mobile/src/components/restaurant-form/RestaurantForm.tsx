import { RatingFace } from '../rating-face/RatingFace';
import { VisitedIcon } from '../restaurant-card/VisitedIcon';
import { RESTAURANT_RATINGS } from '@restaurantes/contracts';
import { AppButton, AppText } from '@/components';
import { AppTextField } from '@/components/text-field';
import { useRestaurants } from '@/services';
import { Alert, Linking, Pressable, TextInput, View } from 'react-native';
import { styles } from './restaurantForm.styles';
import { RestaurantFormProps } from './restaurantForm.types';

export const RestaurantForm = ({ value, onChange, onSave, visitOnly = false, onOpinionLayout, opinionMinHeight }: RestaurantFormProps) => {
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
      <View style={visitOnly && styles.disabled}>
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
            <Pressable
              disabled={visitOnly}
              accessibilityState={{ disabled: visitOnly }}
              accessibilityLabel="Buscar en Google Maps"
              style={[styles.searchIcon, styles.mapsIcon]}
              onPress={() => openSearch('maps')}
            >
              <AppText style={styles.mapsSymbol} text="⌖" />
            </Pressable>
            <Pressable
              disabled={visitOnly}
              accessibilityState={{ disabled: visitOnly }}
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
          editable={!visitOnly}
          accessibilityState={{ disabled: visitOnly }}
          label="Localidad"
          value={value.locality}
          onChangeText={(text) => onChange('locality', text)}
          placeholder="Ciudad, barrio o dirección"
        />
        <AppTextField
          editable={!visitOnly}
          accessibilityState={{ disabled: visitOnly }}
          label="Platos recomendados"
          value={value.dishes}
          onChangeText={(text) => onChange('dishes', text)}
          placeholder="Ej. croquetas, ramen..."
        />
        <AppTextField
          editable={!visitOnly}
          accessibilityState={{ disabled: visitOnly }}
          label="Estimación de precio"
          value={value.price}
          onChangeText={(text) => onChange('price', text)}
          placeholder="Ej. 20–30 € por persona"
        />
        <AppText style={styles.label} text="Tipo de local" />
        {typesError ? <Pressable disabled={visitOnly} accessibilityState={{ disabled: visitOnly }} accessibilityRole="button" onPress={reloadTypes}><AppText text={typesError} /></Pressable> : null}
        <View style={styles.chips}>
          {restaurantTypes.map((type) => (
            <Pressable
              disabled={visitOnly}
              accessibilityState={{ disabled: visitOnly }}
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
          editable={!visitOnly}
          accessibilityState={{ disabled: visitOnly }}
          label="Recomendado por"
          value={value.recommendedBy}
          onChangeText={(text) => onChange('recommendedBy', text)}
          placeholder="Nombre de la persona que te lo recomendó"
        />
        <AppTextField
          editable={!visitOnly}
          accessibilityState={{ disabled: visitOnly }}
          label="Observaciones"
          value={value.notes}
          onChangeText={(text) => onChange('notes', text)}
          placeholder="Reserva, detalles a tener en cuenta..."
          multiline
        />
      </View>
      <View onLayout={(event) => onOpinionLayout?.(event.nativeEvent.layout.y)} style={{ minHeight: opinionMinHeight }}>
        <View style={styles.field}>
          {value.visited ? (
            <View style={styles.visitRow}>
              <View accessible accessibilityLabel="Visita registrada en el formulario">
                <VisitedIcon />
              </View>
              {!visitOnly ? (
                <Pressable accessibilityRole="button" style={styles.visitButton} onPress={() => onChange('visited', false)}>
                  <AppText style={styles.visitButtonText} text="Quitar visita" />
                </Pressable>
              ) : null}
            </View>
          ) : (
            <Pressable accessibilityRole="button" style={styles.visitButton} onPress={() => onChange('visited', true)}>
              <AppText style={styles.visitButtonText} text="Registrar visita" />
            </Pressable>
          )}
        </View>
        {value.visited ? (
          <>
            <AppTextField
              label="Mi opinión"
              value={value.opinion}
              onChangeText={(text) => onChange('opinion', text)}
              placeholder="¿Qué te ha gustado? ¿Qué no recomendarías?"
              maxLength={4000}
              multiline
            />
            <AppText style={styles.label} text="¿Qué te ha parecido?" />
            <View style={styles.chips}>
              {RESTAURANT_RATINGS.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityLabel={option.label}
                  accessibilityState={{ checked: value.rating === option.value }}
                  onPress={() => onChange('rating', option.value)}
                  style={[styles.chip, styles.ratingOption, value.rating === option.value && styles.chipSelected]}
                >
                  <RatingFace rating={option.value} />
                  <AppText style={[styles.chipText, value.rating === option.value && styles.chipTextSelected]} text={option.label} />
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
        <AppButton label={visitOnly ? 'Guardar visita' : 'Guardar restaurante'} onPress={onSave} />
      </View>
    </View>
  );
};
