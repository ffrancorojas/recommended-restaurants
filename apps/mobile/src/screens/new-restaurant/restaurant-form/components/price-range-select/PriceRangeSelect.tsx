import { useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { PRICE_RANGES } from '@restaurantes/contracts';
import { AppText } from '@/components/text';
import { styles } from './priceRangeSelect.styles';
import type { PriceRangeSelectProps } from './priceRangeSelect.types';

const options = [{ value: '', label: 'Sin especificar' }, ...PRICE_RANGES] as const;

export const PriceRangeSelect = ({ value, onChange, disabled = false }: PriceRangeSelectProps) => {
  const [open, setOpen] = useState(false);
  const label = options.find((option) => option.value === value)?.label ?? 'Sin especificar';
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Estimación de precio: ${label}`}
        accessibilityState={{ expanded: open && !disabled, disabled }}
        disabled={disabled}
        style={styles.trigger}
        onPress={() => { Keyboard.dismiss(); setOpen((current) => !current); }}
      >
        <AppText style={styles.text} text={label} />
        <AppText style={styles.text} text={open && !disabled ? '▴' : '▾'} />
      </Pressable>
      {open && !disabled ? (
        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: option.value === value }}
              style={[styles.option, option.value === value && styles.selected]}
              onPress={() => { onChange(option.value); setOpen(false); }}
            >
              <AppText style={styles.text} text={option.label} />
              {option.value === value ? <AppText style={styles.text} text="✓" /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
};
