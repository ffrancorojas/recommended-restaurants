import type { AppColors } from '@/theme';
import { StyleSheet } from 'react-native';

export const createAppButtonStyles = (colors: AppColors) => StyleSheet.create({
  button: { borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginTop: 10 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: 'transparent' },
  text: { fontWeight: '800', fontSize: 16 },
  primaryText: { color: colors.onAccent },
  secondaryText: { color: colors.secondary },
});
