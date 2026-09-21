import { View } from 'react-native';
import {
  LocalityFilter,
  PriceFilter,
  PriceFilterOptions,
  SearchFilter,
  TypesFilter,
  VisitedFilter,
} from './components';
import type { FiltersProps } from './filters.types';
import { useFiltersStyles } from './filters.styles';

export const Filters = ({
  filtersOpen,
  filters,
  updateFiltersValue,
  updateFiltersOpen,
  availableTypes,
  typesError,
  reloadTypes,
}: FiltersProps) => {
  const styles = useFiltersStyles();
  if (!filtersOpen.filtersVisible) return null;
  const { visitedOnly, locality, price, query, types } = filters;
  const dropdownProps = { updateFiltersValue, updateFiltersOpen };

  return (
    <View>
      <VisitedFilter visitedOnly={visitedOnly} updateFiltersValue={updateFiltersValue} />
      <SearchFilter query={query} updateFiltersValue={updateFiltersValue} />
      <View style={styles.filters}>
        <LocalityFilter locality={locality} updateFiltersValue={updateFiltersValue} />
        <PriceFilter priceOpen={filtersOpen.priceOpen} price={price} {...dropdownProps} />
      </View>
      <PriceFilterOptions priceOpen={filtersOpen.priceOpen} price={price} {...dropdownProps} />
      <TypesFilter
        typesOpen={filtersOpen.typesOpen}
        types={types}
        availableTypes={availableTypes}
        typesError={typesError}
        reloadTypes={reloadTypes}
        {...dropdownProps}
      />
    </View>
  );
};
