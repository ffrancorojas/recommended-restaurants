import type { AppColors } from '@/theme';
import { StyleSheet } from 'react-native';

export const createHeaderStyles = (colors: AppColors) => StyleSheet.create({
  header: {
    height: 62,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  back: { color: colors.primary, fontWeight: '700', width: 56 },
  spacer: { width: 56 },
});
