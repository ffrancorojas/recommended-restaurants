import { Pressable } from 'react-native';
import { AppText } from '../text';
import { createRestaurantSearchButtonStyles } from './restaurantSearchButtons.styles';
import type { RestaurantSearchButtonsProps } from './restaurantSearchButtons.types';
import { useRestaurantSearch } from './useRestaurantSearch';
import { useThemedStyles } from '@/theme';

export const RestaurantSearchButtons = ({
  name, locality, disabled = false, compact = false,
}: RestaurantSearchButtonsProps) => {
  const { openSearch } = useRestaurantSearch(name, locality);
  const styles = useThemedStyles(createRestaurantSearchButtonStyles);

  return (
    <>
      <Pressable
        disabled={disabled}
        accessibilityState={{ disabled }}
        accessibilityRole="link"
        accessibilityLabel={`Buscar ${name} en Google Maps`}
        style={[styles.button, compact && styles.compactButton, styles.mapsIcon]}
        hitSlop={compact ? 4 : undefined}
        onPress={(event) => {
          event.stopPropagation();
          void openSearch('maps');
        }}
      >
        <AppText style={[styles.mapsSymbol, compact && styles.compactMapsSymbol]} text="⌖" />
      </Pressable>
      <Pressable
        disabled={disabled}
        accessibilityState={{ disabled }}
        accessibilityRole="link"
        accessibilityLabel={`Buscar ${name} en Google`}
        style={[styles.button, compact && styles.compactButton, styles.googleIcon]}
        hitSlop={compact ? 4 : undefined}
        onPress={(event) => {
          event.stopPropagation();
          void openSearch('google');
        }}
      >
        <AppText style={[styles.googleSymbol, compact && styles.compactGoogleSymbol]} text="G" />
      </Pressable>
    </>
  );
};
