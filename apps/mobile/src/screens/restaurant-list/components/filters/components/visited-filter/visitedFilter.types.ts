import type { FilterValueProps } from '../../filters.types';

export type VisitedFilterProps = FilterValueProps & {
  visitedOnly: boolean;
};
