import type { RestaurantType } from '@/types';
import type { FilterOpenProps, FilterValueProps, FiltersProps } from '../../filters.types';

export type TypesFilterProps = FilterOpenProps & FilterValueProps &
  Pick<FiltersProps, 'availableTypes' | 'typesError' | 'reloadTypes'> & {
    types: RestaurantType[];
    typesOpen: boolean;
  };
