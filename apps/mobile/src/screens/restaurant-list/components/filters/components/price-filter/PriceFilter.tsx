import { AppText } from '@/components';
import { Keyboard, Pressable, ScrollView, View } from 'react-native';
import { PRICE_RANGES } from '../../../../restaurantListScreen.tools';
import { styles } from '../../filters.styles';
import type { PriceFilterProps } from './priceFilter.types';

export const PriceFilter = ({ price, priceOpen, updateFiltersOpen }: PriceFilterProps) => (
  <Pressable
    style={[styles.mini, styles.priceTrigger]}
    accessibilityRole="button"
    accessibilityLabel={`Filtrar por precio: ${PRICE_RANGES.find((range) => range.value === price)?.label}`}
    accessibilityState={{ expanded: priceOpen }}
    onPress={() => {
      Keyboard.dismiss();
      updateFiltersOpen({ key: 'priceOpen', value: !priceOpen });
    }}
  >
    <AppText
      style={styles.dropdownLabel}
      text={PRICE_RANGES.find((range) => range.value === price)?.label ?? 'Todos los precios'}
    />
    <AppText style={styles.dropdownLabel} text={priceOpen ? '▴' : '▾'} />
  </Pressable>
);

export const PriceFilterOptions = ({
  price,
  priceOpen,
  updateFiltersValue,
  updateFiltersOpen,
}: PriceFilterProps) => {
  if (!priceOpen) return null;
  return (
    <View style={styles.dropdown}>
      <ScrollView
        style={styles.options}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        {PRICE_RANGES.map((range) => (
          <Pressable
            key={range.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: price === range.value }}
            style={[styles.option, price === range.value && styles.priceOptionSelected]}
            onPress={() => {
              updateFiltersValue({ key: 'price', value: range.value });
              updateFiltersOpen({ key: 'priceOpen', value: false });
            }}
          >
            <AppText style={styles.dropdownLabel} text={range.label} />
            {price === range.value ? (
              <AppText style={styles.dropdownLabel} text="✓" />
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};
