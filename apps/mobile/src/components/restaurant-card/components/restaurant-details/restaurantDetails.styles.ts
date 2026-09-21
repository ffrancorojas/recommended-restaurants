import type { AppColors } from '@/theme';
import { StyleSheet } from 'react-native';

export const createRestaurantDetailsStyles = (colors: AppColors) => StyleSheet.create({
  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  delete: { color: colors.danger, fontSize: 12, fontWeight: '700' },
});
