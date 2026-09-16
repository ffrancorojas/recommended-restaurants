import type { RestaurantFormData, RestaurantType } from '@restaurantes/contracts';
export { RESTAURANT_TYPES } from '@restaurantes/contracts';
export type { Restaurant, RestaurantFormData, RestaurantType } from '@restaurantes/contracts';

export type RestaurantFilters = {
  query: string;
  locality: string;
  price: string;
  types: RestaurantType[];
  visitedOnly: boolean;
};

export const EMPTY_RESTAURANT_FORM: RestaurantFormData = {
  name: '',
  locality: '',
  dishes: '',
  price: '',
  type: '',
  notes: '',
  recommendedBy: '',
  visited: false,
  opinion: '',
  rating: '',
};
