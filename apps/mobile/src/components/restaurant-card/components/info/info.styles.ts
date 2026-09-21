import { useThemedStyles, type AppColors } from '@/theme';
import { StyleSheet } from 'react-native';

export const createInfoStyles = (colors: AppColors) => StyleSheet.create({
  info: { marginBottom: 8 },
  infoLabel: {
    color: colors.muted,
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: { color: colors.text, marginTop: 2, lineHeight: 20 },
});

export const useInfoStyles = () => useThemedStyles(createInfoStyles);
