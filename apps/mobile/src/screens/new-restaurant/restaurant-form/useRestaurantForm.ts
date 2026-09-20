import { useRestaurants } from '@/services';
import type { RestaurantFormProps } from './restaurantForm.types';

export const useRestaurantForm = ({ value, onChange }: Pick<RestaurantFormProps, 'value' | 'onChange'>) => {
  const { restaurantTypes, typesError, reloadTypes } = useRestaurants();

  const toggleType = (type: RestaurantFormProps['value']['type'][number]) =>
    onChange('type', value.type.includes(type)
      ? value.type.filter((selected) => selected !== type)
      : [...value.type, type]);

  return { restaurantTypes, typesError, reloadTypes, toggleType };
};
