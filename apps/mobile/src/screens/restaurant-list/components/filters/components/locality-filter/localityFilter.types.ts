import type { FilterValueProps } from '../../filters.types';

export type LocalityFilterProps = FilterValueProps & {
  locality: string;
};
