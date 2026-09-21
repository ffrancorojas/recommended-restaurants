import { Pressable, View } from 'react-native';
import { AppText } from '@/components/text';
import { useRestaurantFormStyles } from '../../restaurantForm.styles';
import type { RestaurantFieldProps } from '../../restaurantForm.types';
import { VisitedIcon } from '@/components/restaurant-card/VisitedIcon';

export const RestaurantVisitField = ({ value, onChange, visitOnly = false }: RestaurantFieldProps) => {
  const styles = useRestaurantFormStyles();
  return <View style={styles.field}>
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
  </View>;
};
