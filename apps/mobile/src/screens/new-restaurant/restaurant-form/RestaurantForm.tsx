import { View } from 'react-native';
import { AppButton } from '@/components/button';
import { useRestaurantFormStyles } from './restaurantForm.styles';
import type { RestaurantFormProps } from './restaurantForm.types';
import { useRestaurantForm } from './useRestaurantForm';
import {
  RestaurantNameField,
  LocalityField,
  DishesField,
  RestaurantPriceField,
  RestaurantTypesField,
  RecommendedByField,
  NotesField,
  RestaurantVisitField,
  OpinionField,
  RestaurantRatingField,
} from './components';

export const RestaurantForm = ({
  value, onChange, onSave, visitOnly = false, onOpinionLayout, opinionMinHeight,
}: RestaurantFormProps) => {
  const styles = useRestaurantFormStyles();
  const { restaurantTypes, typesError, reloadTypes, toggleType } =
    useRestaurantForm({ value, onChange });
  const fieldProps = { value, onChange, visitOnly };

  return (
    <View>
      <View style={visitOnly && styles.disabled}>
        <RestaurantNameField {...fieldProps} />
        <LocalityField {...fieldProps} />
        <DishesField {...fieldProps} />
        <RestaurantPriceField {...fieldProps} />
        <RestaurantTypesField
          value={value}
          visitOnly={visitOnly}
          restaurantTypes={restaurantTypes}
          typesError={typesError}
          reloadTypes={reloadTypes}
          onToggleType={toggleType}
        />
        <RecommendedByField {...fieldProps} />
        <NotesField {...fieldProps} />
      </View>
      <View
        onLayout={(event) => onOpinionLayout?.(event.nativeEvent.layout.y)}
        style={{ minHeight: opinionMinHeight }}
      >
        <RestaurantVisitField {...fieldProps} />
        {value.visited ? (
          <>
            <OpinionField value={value} onChange={onChange} />
            <RestaurantRatingField value={value} onChange={onChange} />
          </>
        ) : null}
        <AppButton label={visitOnly ? 'Guardar visita' : 'Guardar restaurante'} onPress={onSave} />
      </View>
    </View>
  );
};
