import { TextInput } from 'react-native';
import { styles } from '../../filters.styles';
import type { SearchFilterProps } from './searchFilter.types';

export const SearchFilter = ({ query, updateFiltersValue }: SearchFilterProps) => (
  <TextInput
    style={styles.search}
    placeholder="Buscar en mis recomendaciones"
    placeholderTextColor="#9A9088"
    value={query}
    onChangeText={(value) => updateFiltersValue({ key: 'query', value })}
  />
);
