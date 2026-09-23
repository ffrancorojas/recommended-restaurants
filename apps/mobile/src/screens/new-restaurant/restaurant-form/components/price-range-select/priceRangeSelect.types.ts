import type { PriceRange } from '@/types';
import type { StyleProp, ViewStyle } from 'react-native';

export type PriceRangeSelectProps = {
  value: PriceRange;
  onChange: (value: PriceRange) => void;
  disabled?: boolean;
  emptyLabel?: string;
  style?: StyleProp<ViewStyle>;
  onOpenChange?: (open: boolean) => void;
};
