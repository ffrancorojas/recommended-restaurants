import type { PriceRange } from '@/types';
import type { FilterOpenProps, FilterValueProps } from '../../filters.types';

export type PriceFilterProps = FilterOpenProps & FilterValueProps & {
  price: PriceRange;
  priceOpen: boolean;
};
