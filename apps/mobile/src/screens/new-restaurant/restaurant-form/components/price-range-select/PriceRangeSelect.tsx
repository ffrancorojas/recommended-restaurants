import { Keyboard } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { PRICE_RANGES } from '@restaurantes/contracts';
import { useAppColors, useThemedStyles } from '@/theme';
import type { PriceRange } from '@/types';
import { createPriceRangeSelectStyles } from './priceRangeSelect.styles';
import type { PriceRangeSelectProps } from './priceRangeSelect.types';

const options: { value: PriceRange; label: string }[] = [
  { value: '', label: 'Sin especificar' },
  ...PRICE_RANGES,
];

export const PriceRangeSelect = ({ value, onChange, disabled = false }: PriceRangeSelectProps) => {
  const colors = useAppColors();
  const styles = useThemedStyles(createPriceRangeSelectStyles);
  const label = options.find((option) => option.value === value)?.label ?? 'Sin especificar';
  return (
    <Dropdown
      data={options}
      labelField="label"
      valueField="value"
      value={value}
      onChange={(option) => onChange(option.value)}
      disable={disabled}
      onFocus={() => Keyboard.dismiss()}
      placeholder="Sin especificar"
      accessibilityLabel={`Estimación de precio: ${label}`}
      itemAccessibilityLabelField="label"
      style={styles.trigger}
      containerStyle={styles.options}
      selectedTextStyle={styles.text}
      placeholderStyle={styles.text}
      itemTextStyle={styles.text}
      backgroundColor={colors.surface}
      activeColor={colors.softGreen}
      iconColor={colors.text}
    />
  );
};
