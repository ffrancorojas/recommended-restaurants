import { AppText } from '@/components';
import { Switch, View } from 'react-native';
import type { VisitedFilterProps } from './visitedFilter.types';

import { styles } from '../../filters.styles';

export const VisitedFilter = ({ visitedOnly, updateFiltersValue }: VisitedFilterProps) => {
  return (
    <View style={styles.dropdownTrigger}>
      <AppText style={styles.dropdownLabel} text="Solo visitados" />
      <Switch
        accessibilityLabel="Solo visitados"
        value={visitedOnly}
        onValueChange={(value) => updateFiltersValue({ key: 'visitedOnly', value })}
      />
    </View>
  );
};
