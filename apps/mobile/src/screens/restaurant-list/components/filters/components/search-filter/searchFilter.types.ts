import type { FilterValueProps } from '../../filters.types';

export type SearchFilterProps = FilterValueProps & {
  query: string;
};
