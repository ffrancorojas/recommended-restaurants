import type { RestaurantFormData, RestaurantType } from '@restaurantes/contracts';
import type { PriceRange } from './priceRange';
export { RESTAURANT_TYPES } from '@restaurantes/contracts';
export type { Restaurant, RestaurantFormData, RestaurantType } from '@restaurantes/contracts';

export type RestaurantFilters = {
  query: string;
  locality: string;
  price: PriceRange;
  types: RestaurantType[];
  visitedOnly: boolean;
};

type KeyRestaurantFilters = keyof RestaurantFilters;

export type RestaurantFilterAction = {
  [K in KeyRestaurantFilters]: {
    key: K;
    value: RestaurantFilters[K];
  };
}[KeyRestaurantFilters];

export const EMPTY_RESTAURANT_FORM: RestaurantFormData = {
  name: '',
  locality: '',
  dishes: '',
  price: '',
  type: [],
  notes: '',
  recommendedBy: '',
  visited: false,
  opinion: '',
  rating: '',
};

export type FiltersOpen = {
  typesOpen: boolean;
  priceOpen: boolean;
  filtersVisible: boolean;
};

export type KeyFiltersOpen = keyof FiltersOpen;
export type KeyFiltersOpenAction = {
  [K in KeyFiltersOpen]: {
    key: K;
    value: FiltersOpen[K];
  };
}[KeyFiltersOpen];
