import type { RestaurantFilters, RestaurantType } from '@/types';
import type { FiltersOpen, KeyFiltersOpenAction, RestaurantFilterAction } from '@/types/restaurant';

export type FilterValueProps = {
  updateFiltersValue: (action: RestaurantFilterAction) => void;
};

export type FilterOpenProps = {
  updateFiltersOpen: (action: KeyFiltersOpenAction) => void;
};

export type FiltersProps = FilterValueProps & FilterOpenProps & {
  filtersOpen: FiltersOpen;
  filters: RestaurantFilters;
  availableTypes: RestaurantType[];
  typesError: string | null;
  reloadTypes: () => Promise<void>;
};
