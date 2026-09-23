import { Keyboard } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { PRICE_RANGES } from '@restaurantes/contracts';
import { useAppColors, useThemedStyles } from '@/theme';
import type { PriceRange } from '@/types';
import { createPriceRangeSelectStyles } from './priceRangeSelect.styles';
import type { PriceRangeSelectProps } from './priceRangeSelect.types';

export const PriceRangeSelect = ({
  value,
  onChange,
  disabled = false,
  emptyLabel = 'Sin especificar',
  style,
  onOpenChange,
}: PriceRangeSelectProps) => {
  const colors = useAppColors();
  const styles = useThemedStyles(createPriceRangeSelectStyles);
  const options: { value: PriceRange; label: string }[] = [
    { value: '', label: emptyLabel },
    ...PRICE_RANGES,
  ];
  const label = options.find((option) => option.value === value)?.label ?? 'Sin especificar';
  return (
    <Dropdown
      data={options}
      labelField="label"
      valueField="value"
      value={value}
      onChange={(option) => {
        onChange(option.value);
        onOpenChange?.(false);
      }}
      disable={disabled}
      onFocus={() => {
        Keyboard.dismiss();
        onOpenChange?.(true);
      }}
      onBlur={() => onOpenChange?.(false)}
      placeholder={emptyLabel}
      accessibilityLabel={`Estimación de precio: ${label}`}
      itemAccessibilityLabelField="label"
      style={[styles.trigger, style]}
      containerStyle={styles.options}
      selectedTextStyle={styles.text}
      placeholderStyle={styles.text}
      itemContainerStyle={styles.item}
      itemTextStyle={styles.itemText}
      mode="default"
      dropdownPosition="auto"
      backgroundColor="rgba(0, 0, 0, 0.28)"
      activeColor={colors.softGreen}
      iconColor={colors.text}
    />
  );
};
