import { TextInput } from 'react-native';
import { useAppColors } from '@/theme';
import { useFiltersStyles } from '../../filters.styles';
import type { LocalityFilterProps } from './localityFilter.types';

export const LocalityFilter = ({ locality, updateFiltersValue }: LocalityFilterProps) => {
  const styles = useFiltersStyles();
  const colors = useAppColors();
  return <TextInput
    style={[styles.mini, { color: colors.text }]}
    accessibilityLabel="Filtrar por localidad"
      placeholder="Localidad: ej. Madrid"
    placeholderTextColor={colors.placeholder}
    value={locality}
    onChangeText={(value) => updateFiltersValue({ key: 'locality', value })}
  />;
};
