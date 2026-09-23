import { PriceRangeSelect } from '@/screens/new-restaurant/restaurant-form/components/price-range-select';
import { useFiltersStyles } from '../../filters.styles';
import type { PriceFilterProps } from './priceFilter.types';

export const PriceFilter = ({ price, updateFiltersValue, updateFiltersOpen }: PriceFilterProps) => {
  const styles = useFiltersStyles();
  return <PriceRangeSelect
    value={price}
    emptyLabel="Todos los precios"
    onChange={(value) => updateFiltersValue({ key: 'price', value })}
    onOpenChange={(open) => updateFiltersOpen({ key: 'priceOpen', value: open })}
    style={styles.mini}
  />;
};
