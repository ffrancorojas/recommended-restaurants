import { Pressable, View } from 'react-native';
import { AppText } from '@/components/text';
import { useRestaurantFormStyles } from '../../restaurantForm.styles';
import type { RestaurantTypesFieldProps } from '../../restaurantForm.types';

export const RestaurantTypesField = ({ value, visitOnly = false, restaurantTypes, typesError, reloadTypes, onToggleType }: RestaurantTypesFieldProps) => {
  const styles = useRestaurantFormStyles();
  return <>
    <AppText style={styles.label} text="Tipos de local" />
    <AppText style={styles.help} text="Puedes seleccionar varios tipos." />
    {typesError ? <Pressable disabled={visitOnly} accessibilityState={{ disabled: visitOnly }} accessibilityRole="button" onPress={reloadTypes}><AppText text={typesError} /></Pressable> : null}
    <View style={styles.chips}>
      {restaurantTypes.map((type) => (
        <Pressable
          disabled={visitOnly}
          accessibilityRole="checkbox"
          accessibilityLabel={type}
          accessibilityState={{ disabled: visitOnly, checked: value.type.includes(type) }}
          key={type}
          onPress={() => onToggleType(type)}
          style={[styles.chip, value.type.includes(type) && styles.chipSelected]}
        >
          <AppText
            style={[styles.chipText, value.type.includes(type) && styles.chipTextSelected]}
            text={`${value.type.includes(type) ? '✓ ' : ''}${type}`}
          />
        </Pressable>
      ))}
    </View>
  </>;
};
