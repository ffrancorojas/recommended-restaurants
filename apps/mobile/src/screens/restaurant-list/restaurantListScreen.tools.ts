import type { PriceRange, RestaurantFilters } from '@/types';
import { PRICE_RANGES as RESTAURANT_PRICE_RANGES } from '@restaurantes/contracts';

export const PRICE_RANGES: ReadonlyArray<{ value: PriceRange; label: string }> = [
  { value: '', label: 'Todos los precios' },
  ...RESTAURANT_PRICE_RANGES,
] as const;

export const initialFilters: RestaurantFilters = {
  query: '',
  locality: '',
  price: '',
  types: [],
  visitedOnly: false,
};
