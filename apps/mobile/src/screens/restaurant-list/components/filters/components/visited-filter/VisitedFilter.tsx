import { AppText } from '@/components';
import { Switch, View } from 'react-native';
import type { VisitedFilterProps } from './visitedFilter.types';
import { useAppColors } from '@/theme';

import { useFiltersStyles } from '../../filters.styles';

export const VisitedFilter = ({ visitedOnly, updateFiltersValue }: VisitedFilterProps) => {
  const styles = useFiltersStyles();
  const colors = useAppColors();
  return (
    <View style={styles.dropdownTrigger}>
      <AppText style={styles.dropdownLabel} text="Solo visitados" />
      <Switch
        accessibilityLabel="Solo visitados"
        value={visitedOnly}
        trackColor={{ false: colors.border, true: colors.softGreen }}
        thumbColor={visitedOnly ? colors.secondary : colors.muted}
        onValueChange={(value) => updateFiltersValue({ key: 'visitedOnly', value })}
      />
    </View>
  );
};
