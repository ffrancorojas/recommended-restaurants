import type { PriceRange } from '@/types';

export type PriceRangeSelectProps = {
  value: PriceRange;
  onChange: (value: PriceRange) => void;
  disabled?: boolean;
};
