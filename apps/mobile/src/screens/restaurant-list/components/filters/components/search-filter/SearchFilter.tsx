import { TextInput } from 'react-native';
import { useAppColors } from '@/theme';
import { useFiltersStyles } from '../../filters.styles';
import type { SearchFilterProps } from './searchFilter.types';

export const SearchFilter = ({ query, updateFiltersValue }: SearchFilterProps) => {
  const styles = useFiltersStyles();
  const colors = useAppColors();
  return <TextInput
    style={[styles.search, { color: colors.text }]}
    placeholder="Buscar en mis recomendaciones"
    placeholderTextColor={colors.placeholder}
    value={query}
    onChangeText={(value) => updateFiltersValue({ key: 'query', value })}
  />;
};
