import { TextInput } from 'react-native';
import { styles } from '../../filters.styles';
import type { LocalityFilterProps } from './localityFilter.types';

export const LocalityFilter = ({ locality, updateFiltersValue }: LocalityFilterProps) => (
  <TextInput
    style={styles.mini}
    accessibilityLabel="Filtrar por localidad"
      placeholder="Localidad: ej. Madrid"
    placeholderTextColor="#9A9088"
    value={locality}
    onChangeText={(value) => updateFiltersValue({ key: 'locality', value })}
  />
);
