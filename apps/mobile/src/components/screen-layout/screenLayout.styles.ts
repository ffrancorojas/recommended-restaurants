import type { AppColors } from '@/theme';
import { StyleSheet } from 'react-native';

export const createScreenLayoutStyles = (colors: AppColors) => StyleSheet.create({
  keyboard: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.background },
});
