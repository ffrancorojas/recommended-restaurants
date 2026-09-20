import { Keyboard, Pressable, View } from 'react-native';
import { styles } from './filterButton.styles';
import { AppText } from '@/components';
import { FilterButtonProps } from './filterButton.types';

export const FilterButton = ({ activeFilterCount, filtersVisible, onPress }: FilterButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${filtersVisible ? 'Ocultar filtros' : 'Mostrar filtros'}${activeFilterCount ? `, ${activeFilterCount} activos` : ''}`}
      accessibilityState={{ expanded: filtersVisible }}
      style={[styles.filtersToggle, filtersVisible && styles.filtersToggleOpen]}
      onPress={() => {
        Keyboard.dismiss();
        onPress();
      }}
    >
      <View accessible={false} pointerEvents="none" style={styles.filterIcon}>
        <View style={styles.filterFunnel} />
        <View style={styles.filterStem} />
      </View>
      {!!activeFilterCount && (
        <View style={styles.filterBadge}>
          <AppText style={styles.filterBadgeText} text={String(activeFilterCount)} />
        </View>
      )}
    </Pressable>
  );
};
